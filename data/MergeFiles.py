import csv
from operator import itemgetter

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

def All_MMI_file_process(file_name):
	data = get_csv_records(file_name)
	ALL_MMI_data_result = []
	for row in data:
		row['LocPinConct'] = row['LOCALITY'] + row['PIN']
		ALL_MMI_data_result.append(row)
	return ALL_MMI_data_result

def LocDC_Mapping_file_process(file_name):
	data = get_csv_records(file_name)
	LocDC_Mapping_data_result = []
	for row in data:
		if row['Dispatch Center'] == "":
			row['Dispatch Center'] = row['NSZ']
		row['LocPinConct'] = row['Locality'] + row['Pin']
		LocDC_Mapping_data_result.append(row)
	return LocDC_Mapping_data_result


def DC_List_file_process(file_name,Mapped_DC_List):
	data = get_csv_records(file_name)
	DC_List_data_result = []
	for row in data:
		DC = row['name'] + " (" + row['state'] + ")"
		if DC in Mapped_DC_List:
			result_dict = {}
			result_dict['City'] = row['city']
			result_dict['Rec_name'] = DC #row['name'] + " (" + row['state'] + ")"
			result_dict['pin'] = ""
			result_dict['LAT'] = row['latitude']
			result_dict['LONG'] = row['longitude']
			result_dict['DC'] = "DC"
			DC_List_data_result.append(result_dict)
	return DC_List_data_result

def lookup_process(file1,file2):
	ALL_MMI = All_MMI_file_process(file1)
	LocDC_Mapping = LocDC_Mapping_file_process(file2)
	data1 = sorted(ALL_MMI, key=itemgetter('CITY'), reverse=True)
	data2 = sorted(LocDC_Mapping, key=itemgetter('City'), reverse=True)
	result_data_list = []
	Mapped_DC_List = []
	found = False
	print(len(data2))
	for row1 in data1:
		result_data_dict = {}
		for index,row2 in enumerate(data2):
			if row1['LocPinConct'] == row2['LocPinConct']:
				result_data_dict['City'] = row1['CITY']
				result_data_dict['Rec_name'] = row1['LOCALITY']
				result_data_dict['pin'] = row1['PIN']
				result_data_dict['LAT'] = row1['LAT']
				result_data_dict['LONG'] = row1['LONG']
				result_data_dict['DC'] = row2['Dispatch Center']
				found = True
				result_data_list.append(result_data_dict)
				data2.pop(index)
				Mapped_DC_List.append(row2['Dispatch Center'])
				break
		if(found == False):
			result_data_dict['City'] = row1['CITY']
			result_data_dict['Rec_name'] = row1['LOCALITY']
			result_data_dict['pin'] = row1['PIN']
			result_data_dict['LAT'] = row1['LAT']
			result_data_dict['LONG'] = row1['LONG']
			result_data_dict['DC'] = ""
			result_data_list.append(result_data_dict)
	print (len(data2))					
	return result_data_list,Mapped_DC_List


def AddDCStatusColumn(data):
	result_list = []
	Rec_id = 1
	for row in data:
		if row['DC'] == "":
			row['DC_status'] = '0'
		elif row['DC'].lower() == "nsz":
			row['DC_status'] = '1'
		elif row['DC'].lower() == "dc":
			row['DC_status'] = '3'
		else:
			row['DC_status'] = '2'
		row['Rec_id'] = Rec_id
		result_list.append(row)
		Rec_id += 1
	return result_list

def generate_csv(localities, filename):
    keys = ['Rec_id','City','Rec_name','pin','LAT','LONG','DC','DC_status']
    out_fp = open(filename, 'wb')
    writer = csv.DictWriter(out_fp,fieldnames=keys)
    writer.writeheader()
    writer.writerows(localities)
    out_fp.close()

if __name__ == "__main__":
    All_MMI_file = "All_localities.csv"
    LocDC_Mapping_file = "locality.csv"
    DC_List_file = "DC_list.csv"
    lookup_data,Mapped_DC_List = lookup_process(All_MMI_file,LocDC_Mapping_file)
    filter_DC_List =  DC_List_file_process(DC_List_file,Mapped_DC_List)
    lookup_data.extend(filter_DC_List)
    Output_list = AddDCStatusColumn(lookup_data)
    # print(Output_list)
    generate_csv(Output_list,"data.csv")

    
    