import requests, re, json, os, csv
from flask import flash
from pymongo import MongoClient

def getCityList(state=None):
    cityList=[]
    client = MongoClient('10.0.21.13',replicaset='rs0')
    db = client.dc
    acc = db.locality
    if not state:
        cityList = acc.distinct('city')
    client.close()
    return cityList

def getDcData(dc_ids):
    dcData=[]
    client = MongoClient('10.0.21.13',replicaset='rs0')
    db = client.dc
    acc = db.dc
    if len(dc_ids) == acc.count():
        for a in acc.find({}):
            dcData.append(a)
    else:
        for a in acc.find({'_id':{'$in':dc_ids}}):
            dcData.append(a)
    client.close()
    return dcData

def getCityData(city):
    cityData=[]
    client = MongoClient('10.0.21.13',replicaset='rs0')
    db = client.dc
    acc = db.locality
    if city == 'all cities':
        for a in acc.find({}):
            cityData.append(a)
    else:
        for a in acc.find({'city':city}):
            cityData.append(a)
    client.close()
    return cityData

def getLocDCData(city):
    result = list()
    dc_ids = []
    result.append(getCityData(city))
    for row in result[0]:
        dc_ids.append(row.get('rdc'))
        if row['status'] == 2:
            dc_ids.append(row['mdc'])
    dc_ids = list(set(dc_ids))
    result = [getDcData(dc_ids)] + result
    return json.dumps(result)

