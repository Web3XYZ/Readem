from cgi import print_environ
import  requests
import csv
import sys
import json
import time

import urllib.request, urllib.error
# reload(sys)

def convert(file):

    with open(file,'r') as load_f:
        books = json.load(load_f)

    print(len(books))

    authors = ""
    tempdescs = ""

    ki = 0
    for ki in range(0,len(books)):
        #print(books[ki])
        authors = authors+ books[ki]['author'] +"@"
        tempdescs = tempdescs + books[ki]['description'] +"@"

    authors = authors[:-1]
    # print(authors)
    allauthors = authors.split('@')
    print(len(allauthors))

    tempdescs = tempdescs[:-1]
    # print(tempdescs)
    alldescs = tempdescs.split('@')
    # print(alldescs)
    print(len(alldescs))


    retauthors =  translate_text('en',authors)
    allauthors = retauthors.split('@')
    print(len(allauthors))
    

    retdescs =  translate_text('en',tempdescs)
    alldescs = retdescs.split('@')
    print(len(alldescs))

    vi = 0
    for vi in range(0,len(books)):
        if vi>= len(alldescs):
            break

        books[vi]['author'] = allauthors[vi]
        books[vi]['description'] = alldescs[vi]


    jsonStr = json.dumps(books, ensure_ascii=False)
    # print(jsonStr)
    with open('./books/traditional/new-EN-list.json', "w", encoding="utf-8") as f:
        f.writelines(jsonStr)

    
        
def translate_text(target, content):
	language_type = ""
	url = "https://translation.googleapis.com/language/translate/v2"
	data = {
	    'key':"xxx",
	    'source': language_type,
	    'target': target,
	    'q': content,
	    'format': "text"
	}

    # head = {
    #     "User-Agent": "Mozilla / 5.0 AppleWebKit " #...
    # }

	#headers = {'X-HTTP-Method-Override': 'GET'}
	#response = requests.post(url, data=data, headers=headers)
	response = requests.post(url, data)
	# print(response.json())
	#print(response)
	res = response.json()
	# print(res["data"]["translations"][0]["translatedText"])
	result = res["data"]["translations"][0]["translatedText"]
	print(result)
	return result


if __name__ == '__main__':
    
    convert('./books/traditional/EN-list.json')