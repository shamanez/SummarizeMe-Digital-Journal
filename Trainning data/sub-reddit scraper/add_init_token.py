file_name = "reddit.val.source"
string_to_add = "<TITLE>"

file_name_new=file_name+".txt"




with open(file_name) as in_file, open(file_name_new, "w") as out_file:
   for line in in_file:

        line=line.lstrip().replace("\n", " ")

        final_line=' '.join([string_to_add, line])

        out_file.writelines(final_line+'\n') 





#does not work the following with some reddit thingy..


# with open(file_name, 'r') as f:
#     file_lines = [' '.join([string_to_add, x.replace("\n", " "), '\n']) for x in f.readlines()]

# with open(file_name_new, 'w') as f2:
#     f2.writelines(file_lines) 
