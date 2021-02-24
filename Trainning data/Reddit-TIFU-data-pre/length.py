import csv
import re


our_count=0
cnn_count=0

count=1


with open('sum.csv', 'r') as file:
    reader = csv.reader(file)
    for row in reader:
        

        if row[0]=='Example':
            continue


        count=count+1
        our_word=len(re.sub("[^\w]", " ",  row[3]).split())
        cnn_word=len(re.sub("[^\w]", " ",  row[2]).split())

        our_count=our_count+our_word
        cnn_count=cnn_count+cnn_word





print(our_count,cnn_count,count)   