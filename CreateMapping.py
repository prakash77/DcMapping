import csv ,os, sys ,json
from jinja2 import Environment, FileSystemLoader


def get_csv_records(file_name):
    data = open(file_name,'rU')
    reader = csv.reader(data)
    records_list = []
    keys = reader.next()
    for row in reader:
        record_dict = dict(zip(keys, row))
        records_list.append(record_dict)
    data.close()
    return records_list

def write2json(localities):
	env = Environment(loader=FileSystemLoader(PATH + "\Template"))
	template = env.get_template('helper.js')
	output_from_parsed_template = template.render(data = json.dumps(localities))

	filename = "Template\helperOutput.js"
	with open(filename, "wb") as fh:
		fh.write(output_from_parsed_template)

if __name__ == "__main__":
	PATH = os.path.dirname(os.path.abspath(__file__))
	filename = "Template\data.csv"
	localities = get_csv_records(filename)
	write2json(localities)