import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


/**
 * @dev Implementation of royalties for 721s
 * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2981.md
 */
interface IERC2981 {
    // ERC165 bytes to add to interface array - set in parent contract
    // implementing this standard
    //
    // bytes4(keccak256("royaltyInfo(uint256)")) == 0xcef6d368
    // bytes4(keccak256("onRoyaltiesReceived(address,address,uint256,address,uint256,bytes32)")) == 0xe8cb9d99
    // bytes4(0xcef6d368) ^ bytes4(0xe8cb9d99) == 0x263d4ef1
    // bytes4 private constant _INTERFACE_ID_ERC721ROYALTIES = 0x263d4ef1;
    // _registerInterface(_INTERFACE_ID_ERC721ROYALTIES);

    // @notice Called to return both the creator's address and the royalty percentage
    // @param _tokenId - the NFT asset queried for royalty information
    // @return receiver - address of who should be sent the royalty payment
    // @return amount - a percentage calculated as a fixed point
    //         with a scaling factor of 100000 (5 decimals), such that
    //         100% would be the value 10000000, as 10000000/100000 = 100.
    //         1% would be the value 100000, as 100000/100000 = 1
    function royaltyInfo(uint256 _tokenId) external view returns (address receiver, uint256 amount);

    // @notice Called when royalty is transferred to the receiver. This
    //         emits the RoyaltiesReceived event as we want the NFT contract
    //         itself to contain the event for easy tracking by royalty receivers.
    // @param _royaltyRecipient - The address of who is entitled to the
    //                            royalties as specified by royaltyInfo().
    // @param _buyer - If known, the address buying the NFT on a secondary
    //                 sale. 0x0 if not known.
    // @param _tokenId - the ID of the ERC-721 token that was sold
    // @param _tokenPaid - The address of the ERC-20 token used to pay the
    //                     royalty fee amount. Set to 0x0 if paid in the
    //                     native asset (ETH).
    // @param _amount - The amount being paid to the creator using the
    //                  correct decimals from _tokenPaid's ERC-20 contract
    //                  (i.e. if 7 decimals, 10000000 for 1 token paid)
    // @param _metadata - Arbitrary data attached to this payment
    // @return `bytes4(keccak256("onRoyaltiesReceived(address,address,uint256,address,uint256,bytes32)"))`
    function onRoyaltiesReceived(address _royaltyRecipient, address _buyer, uint256 _tokenId, address _tokenPaid, uint256 _amount, bytes32 _metadata) external returns (bytes4);

    // @dev This event MUST be emitted by `onRoyaltiesReceived()`.
    event RoyaltiesReceived(
        address indexed _royaltyRecipient,
        address indexed _buyer,
        uint256 indexed _tokenId,
        address _tokenPaid,
        uint256 _amount,
        bytes32 _metadata
    );

}


contract Readem721 is ERC721, Ownable, IERC2981 {

    string public constant version = "1.0.0";

    /// bytes4(keccak256("royaltyInfo(uint256)")) == 0xcef6d368
    /// bytes4(keccak256("onRoyaltiesReceived(address,address,uint256,address,uint256,bytes32)")) == 0xe8cb9d99
    /// bytes4(0xcef6d368) ^ bytes4(0xe8cb9d99) == 0x263d4ef1
    bytes4 private constant _INTERFACE_ID_ERC721ROYALTIES = 0x263d4ef1;

    /// @notice Called to return both the creator's address and the royalty percentage
    /// @param _tokenId - the NFT asset queried for royalty information
    /// @return receiver - address of who should be sent the royalty payment
    /// @return amount - a percentage calculated as a fixed point
    ///         with a scaling factor of 100000 (5 decimals), such that
    ///         100% would be the value 10000000, as 10000000/100000 = 100.
    ///         1% would be the value 100000, as 100000/100000 = 1
    struct RoyaltyInfo {
        address creator;
        uint256 amount;
    }

    uint256 public _defultRoyalty = 1000000; // 10%
    string public baseURI;
    mapping(uint256 => RoyaltyInfo) private _royaltyInfos;

    event CreatorChanged(uint256 indexed _id, address indexed _creator);
    event DefultRoyaltyChanged(uint256 _royalty);
    
    constructor(string memory _base) public ERC721("readem.xyz", "Readem721") {
         baseURI = _base;

         //_registerInterface(_INTERFACE_ID_ERC721ROYALTIES);
    }

  function _baseURI() internal view override returns (string memory) {
      return baseURI;
  }

  function setBaseURI(string memory _base) public onlyOwner{
      baseURI = _base;
  }

    function setDefultRoyalty(uint256 _royalty) public onlyOwner{
        _defultRoyalty = _royalty;
        emit DefultRoyaltyChanged(_royalty);
    }

    modifier checkMint (address author, uint256 _tokenId) {
        if (_exists(_tokenId) == false) {
            _mint(author, _tokenId);
            _royaltyInfos[_tokenId].creator = author;
            _royaltyInfos[_tokenId].amount = _defultRoyalty;
        }
        _;
    }

    modifier creatorOnly(uint256 _tokenId) {
        require(
            _royaltyInfos[_tokenId].creator == msg.sender, 
            "MintTLToken: ONLY_CREATOR_ALLOWED"
        );
        _;
    }

    function transferFrom (
        address _from,
        address _to,
        uint256 _tokenId) 
        public 
        checkMint(_from, _tokenId)
        virtual 
        override {
            super.transferFrom(_from, _to, _tokenId);
    }

    function safeTransferFrom(
        address _from, 
        address _to, 
        uint256 _tokenId) 
        public 
        checkMint(_from, _tokenId)
        virtual 
        override {
            super.safeTransferFrom(_from, _to, _tokenId);
    }

    function safeTransferFrom(
        address _from, 
        address _to, 
        uint256 _tokenId, 
        bytes memory _data)
        public 
        checkMint(_from, _tokenId)
        virtual 
        override {
            super.safeTransferFrom(_from, _to, _tokenId, _data);
    }

    function modifyRoyalty(uint256 _tokenId ,uint256 amount) external creatorOnly(_tokenId) {
        _royaltyInfos[_tokenId].amount = amount;
    }

    function setCreator(uint256 _tokenId, address _to) public creatorOnly(_tokenId) {
        require(
            _to != address(0),
            "MintTLToken: INVALID_ADDRESS."
        );
        _royaltyInfos[_tokenId].creator = _to;
        emit CreatorChanged(_tokenId, _to);
    }

    function royaltyInfo(uint256 _tokenId) external view override returns (address receiver, uint256 amount) {
        receiver = _royaltyInfos[_tokenId].creator;
        amount = _royaltyInfos[_tokenId].amount;
    }

    function onRoyaltiesReceived(address _royaltyRecipient, address _buyer, uint256 _tokenId, address _tokenPaid, uint256 _amount, bytes32 _metadata) external override returns (bytes4) {
        emit RoyaltiesReceived(_royaltyRecipient, _buyer, _tokenId, _tokenPaid, _amount, _metadata);    
        return bytes4(keccak256("onRoyaltiesReceived(address,address,uint256,address,uint256,bytes32)"));
    }
}