import torch
from fairseq.models.bart import BARTModel

bart = BARTModel.from_pretrained(
    'checkpoints/',
    checkpoint_file='checkpoint_best.pt',
    data_name_or_path='cnn_dm-bin'
)

bart.cuda()
bart.eval()
bart.half()
count = 1
bsz = 32
with open('/hpc/gsir059/CHI-2020/datasets/REDDIT-TIFU-TEST/source_tifu_len.txt') as source, open('cnn_dm/hypo.tifu.final.bartssl.token.title.30', 'w') as fout:
    condition='<TITLE>'
    
    sline = source.readline().strip()

    sline=' '.join([condition,sline])


    slines = [sline]
    for sline in source:
        if count % bsz == 0:
            with torch.no_grad():
               
                hypotheses_batch = bart.sample(slines, beam=4, lenpen=2.0, max_len_b=100, min_len=30, no_repeat_ngram_size=3)

            for hypothesis in hypotheses_batch:
                fout.write(hypothesis + '\n')
                fout.flush()
            slines = []

        slines.append(' '.join([condition,sline.strip()]))
        count += 1
    if slines != []:
        hypotheses_batch = bart.sample(slines, beam=4, lenpen=2.0, max_len_b=100, min_len=30, no_repeat_ngram_size=3)
        for hypothesis in hypotheses_batch:
            fout.write(hypothesis + '\n')
            fout.flush()

