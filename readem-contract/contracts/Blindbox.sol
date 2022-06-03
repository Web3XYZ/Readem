// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Blindbox is ERC721Enumerable, ERC721Pausable, Ownable {
    using SafeMath for uint256;

    bool public mintPaused = false;
    string private baseTokenURI;
    uint256 private openingProjectId;
    uint256 currentTokenId = 501;
    uint256 mintLimit = 1; 
    mapping(uint256 => mapping(address => bool)) private _whitelists; //ProjectId => _whitelists
    mapping(uint256 => mapping(address => uint32)) private _mintLimit;//ProjectId => limit/address

    IERC20 public busd;

    event eOpen(uint256 boxId, address owner);
    event eOpened(uint256 boxId, address nftContract, uint256 tokenId, address owner);
    event eTransfer(address from, address to, uint256 boxId, uint256 projectId);

    enum NFTProtocol { ERC721, ERC1155 }

    struct NFT {
        address nftContract;
        uint256 tokenId;
        NFTProtocol protocol;
    }

    struct Project {
        uint256 id;
        string name;
        uint32 supply;
        uint256 price;
        uint32 priceType; // 1:ETH 2:BUSD
        uint32 left;
        uint32 startAt;
        uint32 endAt;
        uint32 whiteSeconds;
        uint32 accountMintLimit; 
        NFT[] nfts;
    }

    mapping(uint256 => Project) public projects;
    mapping(uint256 => uint256) public boxProjects; //boxId=>UserProject
    mapping(uint256 => bool) public boxStatuses;

    address private admin;
    
    constructor(
        address _usdtAddress
    ) ERC721("Blindbox Token", "BLINDBOX") {
        busd = IERC20(_usdtAddress);
    }

    function getProjectInfo(uint256 _id) public view returns (Project memory) {
        return projects[_id];
    }

    function initProject(uint256 projectId, string memory name, uint32 startAt, uint32 endAt, uint32 whiteSeconds, uint32 accountMintLimit, uint32 priceType, uint256 price) public {
        require(admin == address(msg.sender) || owner() == address(msg.sender), "Permission denied");
        require(price > 0, "price parameter error");
        require(endAt > startAt, "The end time should be greater than the start time");
        require(endAt > block.timestamp, "The end time should be greater than the current time");
        Project storage project = projects[projectId];
        require(project.id == 0, "project inited");

        project.id = projectId;
        project.name = name;
        project.price = price;
        project.priceType = priceType;
        project.startAt = startAt;
        project.endAt = endAt;
        project.whiteSeconds = whiteSeconds;
        project.accountMintLimit = accountMintLimit;
    }
  
    receive() external payable {}

    function onERC721Received(address /* operator */, address /* from */, uint256 tokenId, bytes calldata /* data */) external returns (bytes4) {
        address nftContract = address(msg.sender);
        receiveNFT(nftContract, tokenId, NFTProtocol.ERC721);
        return this.onERC721Received.selector;
    }

    function onERC1155Received(address /* operator */, address /* from */, uint256 id, uint256 value, bytes calldata /* data */) external returns (bytes4) {
        address nftContract = address(msg.sender);
        for (uint256 i = 0; i < value; i++) {
            receiveNFT(nftContract, id, NFTProtocol.ERC1155);
        }
        return this.onERC1155Received.selector;
    }

    function receiveNFT(address nftContract, uint256 tokenId, NFTProtocol protocol) private {
        Project storage project = projects[openingProjectId];
        require(project.id != 0, "No project to receive NFTs at the moment");
        require(block.timestamp <= project.startAt, "project does not for sale status");
        project.supply += 1;
        project.left += 1;
        NFT memory nft = NFT(nftContract, tokenId, protocol);
        project.nfts.push(nft);
       
    }

    
    function mint(uint256 projectId, uint32 count) public payable {
        require(count <= mintLimit, "Mint limit");
        require(!mintPaused, "Mint Paused");
        require(count > 0, "Count parameter error");
        Project storage project = projects[projectId];
        require(block.timestamp > project.startAt && block.timestamp < project.endAt, "Not yet on sale");
        require(_mintLimit[projectId][msg.sender] < project.accountMintLimit, "Over mint limit");
        // whitelist
        if (block.timestamp <= project.startAt + project.whiteSeconds) {
            // first whiteAt seconds
            require(_whitelists[projectId][msg.sender], "");
            // delete
            delete _whitelists[projectId][msg.sender];
        }
        require(project.left >= count, "Inventory shortage");
        uint256 amount = project.price * count;
        if (project.priceType == 1) {
            require(msg.value >= amount, "Ether value sent is below the price");
        } else {
            require(busd.allowance(msg.sender, address(this)) >= amount, "BUSD allowance value is below the price");
            require(busd.transferFrom(msg.sender, address(this), amount), "BUSD value sent is below the price");
        }

        uint256 boxId;
        for (uint256 index = 0; index < count; index++) {
            boxId = currentTokenId;
            // save project to box
            boxProjects[boxId] = projectId;
            currentTokenId++;
            project.left--;
            _safeMint(msg.sender, boxId);
        }
        // eth
        if (project.priceType == 1 && msg.value > amount) {
            require(payable(msg.sender).send(uint256(msg.value) - amount));
        }
        _mintLimit[projectId][msg.sender]++;
    }

    function openBox(uint256 _boxId) public returns(uint256) {
        address boxOwner = ownerOf(_boxId);
        require(boxOwner == address(msg.sender), "Box not found");
        boxStatuses[_boxId] = true;

        emit eOpen(_boxId, msg.sender);
        return _boxId;
    } 

    function random(uint256 _boxId, uint256 seed) public {
        require(admin == address(msg.sender) || owner() == address(msg.sender), "Permission denied");

        require(boxStatuses[_boxId], "Box not opened");

        uint256 projectId = getProjectId(_boxId);
        require(projectId > 0, "Box not found");

        Project storage project = projects[projectId];
        address boxOwner = ownerOf(_boxId);
        uint256 randomness = getRandom(msg.sender, seed);
        uint index = randomness % project.nfts.length;
        NFT memory nft = project.nfts[index];
        project.nfts[index] = project.nfts[project.nfts.length - 1];
        project.nfts.pop();
    
        _burn(_boxId);

        if (nft.protocol == NFTProtocol.ERC721) {
            ERC721(nft.nftContract).safeTransferFrom(address(this), boxOwner, nft.tokenId);
        } else {
            ERC1155(nft.nftContract).safeTransferFrom(address(this), boxOwner, nft.tokenId, 1, "");
        }
        emit eOpened(_boxId, nft.nftContract, nft.tokenId, boxOwner);
    }

    function getRandom(address owner, uint256 seed) public view returns(uint256) {
        string memory randomKey = "Ym4QnnbqAHZWJTYw2V9s4m546SrTmKKYk";
        return uint256(keccak256(abi.encodePacked(randomKey, block.difficulty, block.timestamp, owner, totalSupply(), seed)));
    }

    function setStartAt(uint256 projectId, uint32 startAt) external {
        require(admin == address(msg.sender) || owner() == address(msg.sender), "Permission denied");
        Project storage project = projects[projectId];
        require(project.id != 0, "Project not found");
        require(project.endAt > startAt, "The end time should be greater than the start time");
        project.startAt = startAt;
    }

    function setEndAt(uint256 projectId, uint32 endAt) external {
        require(admin == address(msg.sender) || owner() == address(msg.sender), "Permission denied");
        Project storage project = projects[projectId];
        require(project.id != 0, "Project not found");
        require(endAt > project.startAt, "The end time should be greater than the start time");
        project.endAt = endAt;
    }

    function withdrawNFTs(uint256 projectId) public {
        require(admin == address(msg.sender) || owner() == address(msg.sender), "Permission denied");
        Project storage project = projects[projectId];
        require(project.id != 0, "Project not found");
        require(block.timestamp > project.endAt, "It's not the end time");
        require(project.left > 0, "Insufficient quantity remaining");
        for (uint256 i = project.left; i > 0; i--) {
            NFT memory nft = project.nfts[i - 1];
            project.nfts.pop();
            if (nft.protocol == NFTProtocol.ERC721) {
                ERC721(nft.nftContract).safeTransferFrom(address(this), owner(), nft.tokenId);
            } else {
                ERC1155(nft.nftContract).safeTransferFrom(address(this), owner(), nft.tokenId, 1, "");
            }
        }
        project.left = 0;
    }

    function setOpeningProjectId(uint256 projectId) public {
        require(admin == address(msg.sender) || owner() == address(msg.sender), "Permission denied");
        openingProjectId = projectId;
    }

    function addWhites(uint256 projectId, address[] memory items) public {
        require(admin == address(msg.sender) || owner() == address(msg.sender), "Permission denied");
        for (uint i=0; i<items.length; i++) {
            _whitelists[projectId][items[i]] = true;
        }
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721Enumerable, ERC721Pausable) {
        super._beforeTokenTransfer(from, to, tokenId);
        uint256 projectId = getProjectId(tokenId);
        emit eTransfer(from, to, tokenId, projectId);
        if (to == address(0)) {
            delete boxProjects[tokenId];
            delete boxStatuses[tokenId];
        }
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokensOfOwner(address _owner) external view returns(uint256[] memory ) {
        uint256 tokenCount = balanceOf(_owner);
        if (tokenCount == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 index;
            for (index = 0; index < tokenCount; index++) {
                result[index] = tokenOfOwnerByIndex(_owner, index);
            }
            return result;
        }
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(baseTokenURI, Strings.toString(_tokenId)));
    }

    function getProjectId(uint256 _boxId) public view returns (uint256) {
        return boxProjects[_boxId];
    }
    
    function setBaseTokenURI(string memory _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function setMintPaused(bool _mintPaused) external onlyOwner {
        mintPaused = _mintPaused;
    }

    function setAdmin(address _address) external onlyOwner {
        admin = _address;
    }

    function setPaused(bool _paused) external onlyOwner {
        if (_paused) {
            _pause();
        } else {
            _unpause();
        }
    }

    function withdrawAll() public onlyOwner {
        require(payable(msg.sender).send(address(this).balance));
    }

    function withdrawAllBUSD() public onlyOwner {
        require(busd.transfer(msg.sender, busd.balanceOf(address(this))));
    }

}
