import json
import re


source_file=open('./soruce_tifu.txt', 'a')
target_file=open('./target_tifu.txt', 'a')

# Read entire file
posts = []
with open('tifu_all_tokenized_and_filtered.json', 'r') as fp:
    for line in fp:
        posts.append(json.loads(line))

# Json entries
#print(posts[50000].keys())

#print(posts[168].get('selftext_without_tldr').replace('\n', ' '))
# print(posts[50000].get('tldr'))
# print(posts[50000].get('title'))

# exit()


i=0
for element in posts:

    if not element.get('tldr') is None:

        
        target_text=element.get('tldr')

    else:
        target_text='shamane'
        


    source_text=element.get('selftext_without_tldr')


    

    source_text=source_text.replace("\n", " ").lstrip(' ')
    target_text=target_text.replace("\n", " ").lstrip(' ')


    source_text=" ".join(source_text.split())
    target_text=" ".join(target_text.split())



    soruce_wordList = re.sub("[^\w]", " ",  source_text).split()
    target_wordList = re.sub("[^\w]", " ",  target_text).split()



    if len(soruce_wordList) < 100:
        continue

    if len(target_wordList)<25:
        continue

    
    if len(target_wordList) >= len(source_text):
        continue

    
    i=i+1



    source_file.write(source_text+'\n')
    target_file.write(target_text+'\n')


    # if i==170:
        
    #     print(source_text)
    #     exit()









exit()
# [u'title_tokenized',
#  u'permalink',
#  u'title',
#  u'url',
#  u'num_comments',
#  u'tldr',  # (optional)
#  u'created_utc',
#  u'trimmed_title_tokenized',
#  u'ups',
#  u'selftext_html',
#  u'score',
#  u'upvote_ratio',
#  u'tldr_tokenized',  # (optional)
#  u'selftext',
#  u'trimmed_title',
#  u'selftext_without_tldr_tokenized',
#  u'id',
#  u'selftext_without_tldr']