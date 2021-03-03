
import io
import os
import sys
import re
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit



#Bart Initialization
#########################################
import torch
from fairseq.models.bart import BARTModel
PRETRAINED_PATH='./checkpoints'

#checking whether we have a GPU or CPU
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(device)
#device='cpu'
#######################################


app = Flask(__name__)

socketio = SocketIO(app)



@app.route('/')
def main():
    return render_template('index.html')



@app.route('/summary', methods=['POST'])
def get_summary():

    recognized_text = request.json['recognized_text']
    recognized_text_clean=recognized_text.replace('\n', ' ')+' '
    wordList = re.sub("[^\w]", " ",  recognized_text_clean).split()


    if len(wordList)<400:
        max_len_b=75
        min_len=35
    
    else:
        max_len_b=140
        min_len=35




    if len(wordList)<20:
    	summarized_text=recognized_text_clean


    else:
        if len(wordList)>250:
           condition='<SUMMARY>'

        else:
           condition='<TITLE>'
           min_len=25

        recognized_text_clean=' '.join([condition,recognized_text_clean])
        print(recognized_text_clean)

        
        summarized_text = bart_ours.sample([recognized_text_clean], beam=4, lenpen=2.0, max_len_b=max_len_b, min_len=min_len, no_repeat_ngram_size=3) #lenpen >1 favours shorter senteces



    #print('summarized_text:',summarized_text)
    return jsonify({'summarized_text': summarized_text})





if __name__ == "__main__":
    #socketio.run(app, '0.0.0.0')
    bart_ours = BARTModel.from_pretrained(PRETRAINED_PATH,checkpoint_file='checkpoint_best.pt')
    bart_ours.to(device)
    bart_ours.eval()

    socketio.run(app, host='0.0.0.0', debug=True,port=8080, keyfile='/sum-keys/key.pem', certfile='/sum-keys/cert.pem')

