import requests
from datetime import datetime
import traceback
import time
import csv


url="https://api.pushshift.io/reddit/submission/search/?limit=1000&sort_type=created_utc&sort=desc&subreddit=confession&before="


start_time = datetime.utcnow()


count=0

previous_epoch = int(start_time.timestamp())



############## csv file creation###############################
final_header_label = ['title', 'id', 'subreddit', 'url','created', 'body']
out_file=open('./confession_.csv', 'wt', newline ='')
csv_output = csv.writer(out_file, delimiter=',')
csv_output.writerow(i for i in final_header_label)
###############################################################


while True:

    new_url= url+str(previous_epoch)
    json =  requests.get(new_url)

    time.sleep(3) # pushshift has a rate limit, if we send requests too fast it will start returning error messages
    json_data = json.json()

    if 'data' not in json_data:
        print("no data in the json request")
        break


    objects = json_data['data']


    if len(objects) == 0:
        print("No seqnece of objects")
        break

 


    
    for object in objects:

        previous_epoch = object['created_utc'] - 1
        

        if object['is_self']:
            if 'selftext' not in object or object['selftext']=='[deleted]' or object['selftext']=='[removed]':
                continue

            try:

                count=count+1 
                print(count)

                int_title=object['title']
                textASCII_title = int_title.encode(encoding='ascii', errors='ignore').decode()
                final_title="".join( textASCII_title.splitlines())

                final_id=object['id']
                final_subreddit=object['subreddit']

                sub_url=object['url']
                created_date=datetime.fromtimestamp(object['created_utc']).strftime("%Y-%m-%d")

  
                text = object['selftext']
                textASCII = text.encode(encoding='ascii', errors='ignore').decode()
                final_string="".join( textASCII.splitlines())

                scrapped_raw=[final_title, final_id,final_subreddit, sub_url,created_date,final_string] 

                csv_output.writerow(scrapped_raw)

     
            except Exception as err:
                print(f"Couldn't print post: {object['url']}")
                print(traceback.format_exc())


    
 