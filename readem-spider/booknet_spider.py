
# coding=utf-8
# @File : spider.py
# @Software : PyCharm

from cgi import print_directory
from bs4 import BeautifulSoup

import urllib.request, urllib.error

import json
import time
import os

import requests
# import datetime
import time

import sqlite3
# import MySQLdb
import pymysql
from pymysql.converters import escape_string
# title = escape_string("ddd")




books = []
def main():

    getBookDataByJson("./books/","booknet")


def getBookImg(book, targetDir):
    #from urllib.request import urlretrieve

    name = book["pic"].split('/')
    print(book["pic"])

    headers={'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
    'Accept-Encoding': 'none',
    'Accept-Language': 'en-US,en;q=0.8',
    'Connection': 'keep-alive'}
    request_=urllib.request.Request(book["pic"],None,headers) #The assembled request
    response = urllib.request.urlopen(request_)# store the response

    #create a new file and write the image
    f = open(targetDir+name[-1],'wb')
    f.write(response.read())
    f.close()
 
def getDescData(descurl, page, tag):

    os.makedirs('./books/'+tag+'/en/chapter', exist_ok=True)
    os.makedirs('./books/'+tag+'/en/pic/', exist_ok=True)
    
    for i in range(0, page):
        url = descurl+str(1+i)+".html"  
        html = askURL(url) 
        soup = BeautifulSoup(html, "html.parser")

        #print(soup)
        booklist= soup.find_all("div", class_="row book-item") 
        print(len(booklist))
        #return

        for item in booklist:
            data = getProfileInfo(item)
            if data != "":
                books.append(data)

            #print(data)
            #return

    print("book count:"+str(len(books)))

    #############################for chapterinfos
    for book in books:
        getCheapterInfo(book)

    jsonStr = json.dumps(books, ensure_ascii=False)
    #print(jsonStr)

    with open('./books/'+tag+'/origin.json', "w", encoding="utf-8") as f:
        f.writelines(jsonStr)



def getProfileInfo(item):

    if item == None:
        return ""
    
    
    #print(item)
    namenode = item.find("h4", class_="book-title") 
    bookname = namenode.find("a").string
    #print(bookname)

    authornode = item.find("p", class_="author-wr") 
    author = authornode.a.string
    #print(author)

    description = authornode.next_sibling.text.strip()
    description = description.replace("\r\n","")
    description = description.replace("\n\n","")

    pricenode = item.find("div", class_="item-price") 
    price  = pricenode.text.strip()
    if price !="Free":
        price = "Paid"

    tagnode = item.find("p", class_="tags-wr") 
    tagsnode = tagnode.find_all("a") 
    tags=[]
    for tag in tagsnode:
        tags.append(tag.string.strip())

    #print(tags)

    timestamp = int(time.time())
    
    imgnode = item.find("div", class_="book-img") 
    bookprofile = "http://booknet.com"+imgnode.find("a", href=True).attrs['href']
    #print(bookprofile)

    bookurl = bookprofile.replace("/book/","/reader/")
    #print(bookurl)

    imgurl = imgnode.find("img").attrs['src']
    #print(imgurl)

    pagenode = item.find("i",class_="material-icons")
    #print(pagenode)

    state = pagenode.next_sibling.text.strip()
    #print(state)

    pages = pagenode.next_sibling.next_sibling.text.split(' ')[0]

    #print(pages)

    indexname = bookurl.split('/')[-1]

    #https://booknet.com/en/reader/royal-ceo-b389991

    data = { 'name' : bookname, 
    'url' : bookurl, 
    'profileurl' : bookprofile, 
    'pic':imgurl, 
    'author':author, 
    'timestamp':timestamp,
    'state':state,
    'description': description[0:-1],
    'indexname':indexname,
    'price':price,
    'tags':tags,
    'pages':pages} 
            
    #print(data)

    return data

def makeRequest(chapterId, page):

    time.sleep(5)
    print(chapterId, page)

    cookies = "_csrf=adaa36ecdd891f6917b6edf173ea57b61ff750ff46245a3b5c33c59bf82aa0f5a%3A2%3A%7Bi%3A0%3Bs%3A5%3A%22_csrf%22%3Bi%3A1%3Bs%3A32%3A%22Wn__cE31EErkjuxluT0pa4465EPD8qjn%22%3B%7D; litera-frontend=87f963bc99f05522679d32c10e322b01; language_content=a3e882b720d303e00adc36d8916c86b13dca6b60c8fbfde50ba511446a9fbe49a%3A2%3A%7Bi%3A0%3Bs%3A16%3A%22language_content%22%3Bi%3A1%3Bs%3A2%3A%22en%22%3B%7D; _gcl_au=1.1.1771175912.1649817575; last_visit=1649817575; sessions_co=1; is_session=1; ref=e23e54140e77618f486ea8c18c44218ba665e4942ef36333bb25fd05ab546089a%3A2%3A%7Bi%3A0%3Bs%3A3%3A%22ref%22%3Bi%3A1%3Bs%3A11%3A%22booknet.com%22%3B%7D; _ga=GA1.2.1792057088.1649817576; _gid=GA1.2.1479178279.1649817576; _ym_uid=1649817576843670538; _ym_d=1649817576; _ym_isad=1; tmr_lvid=39d5ced2f52374f0ae5f7a5b0f052b31; tmr_lvidTS=1649817576527; _ym_visorc=w; tmr_detect=1%7C1649817670225; tmr_reqNum=10"
    cookies = cookies.split(";")
    #print(cookies)

    header={
    "User-Agent": "Mozilla / 5.0 AppleWebKit ",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "x-csrf-token": "kaTtrk6JArlinwamDTb_nAxzvYStuMLeHYKeiQ3e4THGyrLxLcwxiCfadM1nQ4fweSeN9MyM9ugox87NNa-LXw==",
    "cookie": cookies[0],
    }

    body = {
        "chapterId": chapterId, #"3560146",
        "page":page,
        "rsid":"521485d3-a99a-426f-94da-61b57b384088",
        "_csrf":"JWuuB1YRpQFLDZipp9nMvD49Qy-0uouC7qF8evzcQYpEAfRYM1D1SxQ1rfzSm72OV0oQftnc7Ou77QgfrqsS_g=="
    }

    url = 'https://booknet.com/en/reader/get-page'
    r = requests.post(url, data=body,headers=header)
    result = r.json()

    #print(result['data'])
    return result


def repairCheapterInfoByJson(dir,tag):

    os.makedirs(dir+tag+'/en/chapter', exist_ok=True)
    os.makedirs(dir+tag+'/en/pic/', exist_ok=True)

    fetchFile = dir+tag+"/origin.json"
    print(fetchFile)
    #load
    with open(fetchFile,'r') as load_f:
        books = json.load(load_f)

    for book in books:
        if len(book['originindex'])==0:
            #print("repairCheapterInfoByJson>>>>>",book['indexname'])
            getCheapterInfo(book)

    jsonStr = json.dumps(books, ensure_ascii=False)

    with open('./books/'+tag+'/origin_r.json', "w", encoding="utf-8") as f:
        f.writelines(jsonStr)

        

def getCheapterInfo(book):
    
    time.sleep(5)

    url = book['url']
    print("chapter info fetch:>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+url)

    req = requests.post(url)
    html = req.text
    #print(html)

    soup = BeautifulSoup(html, "html.parser")

    #print(html)
    
    chapterlist= soup.find("div", class_="select_change_arrow")  
    if chapterlist == None:
        book['originindex']=[]
        book['origintitle']=[]
        print(">>>>>>>no data!",html)
        return
    
    chapterNode = chapterlist.find("select", class_="form-control22 audio_track_list js-chapter-change")
    chapterlist = chapterNode.find_all("option")
    #print(len(chapterlist))

    originindex=[]
    origintitle=[]
    for item in chapterlist:

        title = item.text
        #print(title)

        value = item['value'] 
        #print(value)

        originindex.append(value)
        origintitle.append(title.strip())


    book['originindex'] = originindex
    book['origintitle'] = origintitle

    print(book)


def converBookListByOrigin(dir, tag):
    #load
    with open(dir+tag+"/origin.json",'r') as load_f:
        books = json.load(load_f)

    booklist =[]
    for book in books:
        
        temp = book['pic'].split('/')
        data = { 'name' : book['name'], 
        'tags' : book['tags'], 
        'pic':temp[-1], 
        'author':book['author'], 
        'timestamp':book['timestamp'], 
        'state':book['state'], 
        'description':book['description'], 
        'indexname':book['indexname'],
        'chapterindexs':book["originindex"],
        'chaptertitles':book['origintitle'],
        "price":book['price'],
        "pages": book['pages']}

        booklist.append(data)
     
    jsonStr = json.dumps(booklist, ensure_ascii=False)
    print(jsonStr)
    with open('./books/'+tag+'/list.json', "w", encoding="utf-8") as f:
        f.writelines(jsonStr)
          
def flushtoDB(dir, category,startId):

    import emoji
    import re
   
    con = pymysql.connect(host='localhost',port=3306,db='readem',user='root',passwd='123456',charset='utf8')

    #con = sqlite3.connect('example.db')
    cur = con.cursor()

    with open(dir+"/origin.json",'r') as load_f:
        books = json.load(load_f)

    book_id = startId
    for book in books:
        tempimg = book['pic'].split('/')

        tempname = escape_string(book['name'])
        tempdesc = escape_string(book['description'])
        tempdesc = emoji.demojize(tempdesc)
        tempdesc = re.sub(':\S+?:', ' ', tempdesc)

        #tempname = sqlite3.escapeString(book['name'])#.replace('"','\\"')
        print(tempname)
        print(tempdesc)
        sql = "INSERT INTO books (`name`,`cover_image`,`author`,`state`,`price`,`category`,`index_name`,`chapter_count`,`page_count`,`locale`,`description`) VALUES ('{0}','{1}','{2}','{3}','{4}','{5}','{6}','{7}','{8}','{9}','{10}');".format(tempname,tempimg[-1],book['author'],book['state'],book['price'],category,book['indexname'],len(book["originindex"]),book['pages'],"EN",tempdesc)
        print(sql)
        cur.execute(sql)
        
        for i in range(0,len(book['originindex'])):
            temp =escape_string(book['origintitle'][i])#.replace('\"','')
            sql = "INSERT INTO chapters (`book_id`,`title`,`chapter_index`) VALUES ('{0}','{1}','{2}');".format(book_id,temp,book['originindex'][i])
            print(sql)

            cur.execute(sql)

        for tag in book['tags']:
            temptag = escape_string(tag)
            sql = "INSERT INTO book_tags (`book_id`,`tag_name`) VALUES ('{0}','{1}');".format(book_id,temptag)
            print(sql)
            cur.execute(sql)

        book_id =book_id+1

    con.commit()
    con.close()
    print("last book_id=",book_id)



def getBookDataByJson(dir, tag):

    os.makedirs(dir+tag+'/en/chapter', exist_ok=True)
    os.makedirs(dir+tag+'/en/pic/', exist_ok=True)

    fetchFile = dir+tag+"/origin.json"
    print(fetchFile)
    #load
    with open(fetchFile,'r') as load_f:
        books = json.load(load_f)

    for book in books:
        
        getBookDataByBook(book, tag, "EN")
        getBookImg(book, dir+tag+'/en/pic/')


def getBookDataByBook(book, tag, language):

    for chapter in book["originindex"]:

        chapterData = makeRequest(chapter,1)
        if chapterData['status'] != 1:
            print("getBookDataByBook error: chapter="+chapter)
            continue

        chapterIndex=book['indexname']+"-"+str(chapter)
        if language=="EN":
            with open("books/"+tag+"/en/chapter/"+chapterIndex+".txt", "a+", encoding="utf-8") as f:

                totalPage = chapterData["totalPages"]

                html = chapterData["data"]
                soup = BeautifulSoup(html, "html.parser")

                # f.writelines('\n')

                for p in soup.find_all("p"):
                    text = p.text.replace(u'\xa0', '')
                    text = text.replace('\r', '')
                    text = text.replace('\n', '')
                    # print(">>>>>>",text,len(text))
                    if len(text)==0:
                        continue


                    f.writelines(text)
                    f.writelines('\n\n')

                if totalPage>1:
                    print("totalPage:",totalPage)

                    for page in range(2,totalPage+1):
                        
                        chapterData = makeRequest(chapter,page)
                        if chapterData['status'] != 1:
                            print("getBookDataByBook error: chapter="+chapter)
                            continue

                        html = chapterData["data"]
                        soup = BeautifulSoup(html, "html.parser")
                        for p in soup.find_all("p"):
                            text = p.text.replace(u'\xa0', '')
                            text = text.replace('\r', '')
                            text = text.replace('\n', '')
                            # print(">>>>>>",text,len(text))
                            if len(text)==0:
                                continue

                            f.writelines(text)
                            f.writelines('\n\n')
                
                    
        else:
            print("unkown language!")

        #return

    #time.sleep(3)


def askURL(url):
    time.sleep(3)
    head = {
        "User-Agent": "Mozilla / 5.0 AppleWebKit " #...
    }
    request = urllib.request.Request(url, headers=head)
    html = ""
    try:
        response = urllib.request.urlopen(request)
        html = response.read().decode("utf-8")
        #print(html)

    except urllib.error.URLError as e:
        if hasattr(e, "code"):
            print(e.code)
        if hasattr(e, "reason"):
            print(e.reason)
    return html


if __name__ == "__main__":
    main()
    print("done!")
