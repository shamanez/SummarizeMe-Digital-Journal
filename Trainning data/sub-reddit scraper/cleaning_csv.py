import csv
import re
csvfile = open('confession_.csv', 'r')

csv_reader = csv.reader(csvfile, delimiter=',')

# final_header_label=['title', 'body']
# out_file=open('./train_1.csv', 'wt', newline ='')
# csv_output = csv.writer(out_file, delimiter=',')
# csv_output.writerow(i for i in final_header_label)

source_file=open('./text/soruce_confession_.txt', 'a')
target_file=open('./text/target_confession_.txt', 'a')
line_count = 0
for row in csv_reader:

    if row[0]=='title':
        continue

    source_text= row[5]
    target_text=row[0]

    source_text=source_text.replace('\n', ' ')
    target_text=target_text.replace('\n', ' ')

    soruce_wordList = re.sub("[^\w]", " ",  source_text).split()
    target_wordList = re.sub("[^\w]", " ",  target_text).split()


   
    if len(soruce_wordList) < 50:
        continue

    if len(target_wordList)<15:
        continue

    
    if len(target_wordList) >= len(source_text):
        continue


    if row[5]=='':
        continue

  
    if row[5][0]=='[':
        continue



    if row[5][:4]=='http':
        continue
    
    line_count=line_count+1
    source_file.write(source_text+'\n')
    target_file.write(target_text+'\n')


print(f'Processed {line_count} lines.')