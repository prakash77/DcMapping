import requests, re, json, os, csv
from flask import flash
from pymongo import MongoClient

def getCityList(state=None):
    cityList=[]
    client = MongoClient()
    db = client.dc
    acc = db.locality
    if not state:
        cityList = acc.distinct('city')
    client.close()
    return cityList

def getDcData(city):
    dcData=[]
    client = MongoClient()
    db = client.dc
    acc = db.dc
    if city == 'all cities':
        for a in acc.find({}):
            dcData.append(a)
    else:
        for a in acc.find({'city':re.compile(r'^'+city+'$',re.IGNORECASE)}):
            dcData.append(a)
    client.close()
    dcData = json.dumps(dcData)
    return dcData


def latlngexists(strng):
    latlngr = re.compile('[0-9]+[.][0-9]+[,]?[ ]+[0-9]+[.][0-9]+')
    latlng = re.findall(latlngr,strng)
    if latlng:
        for i in latlng:
            return i
            break
    else:
        return None

def geocode(query):
    credentials = 'AIzaSyBsBmC3Iu_3bKeKGceaKBThSCcANv3GmTM'
    if latlngexists(query):
        addJson = requests.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + query + '&key=' + credentials)
    else:
        addJson = requests.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + query + '&key=' + credentials)
    addDict = json.loads(addJson.text)
    addTableSet = []
    for x in addDict['results']:
        addTable = {}
        addTable[u'formatted_address']=x.get('formatted_address',None)
        addTable[u'place_id']=x.get('place_id',None)
        addTableSet.append(addTable)
    return addDict, addTableSet

def mongoDump(resultList):
    client = MongoClient()
    db = client.addcol
    acc = db.addDumps
    count = [0,0]
    for r in resultList:
        if acc.find({'place_id':r['place_id']}).count() > 0 :
            mongo_rec = acc.find_one({'place_id':r['place_id']})
            r['ngram'] = mongo_rec.get('ngram',[])
            r['city'] = mongo_rec.get('city',[])
            acc.replace_one({'place_id':r['place_id']},r)
            count[0] =count[0] + 1
        else:
            r['ngram'] = []
            r['city'] = []
            acc.insert_one(r)
            count[1] =count[1] + 1
    flash( str(count[1]) + " unique records are inserted and "+ str(count[0]) +" duplicate records are updated in Mongodb","success")
    client.close()

def getStateList():
    stateList=[]
    client = MongoClient()
    db = client.addcol
    acc = db.addDumps
    for a in acc.find({'address_components':{'$elemMatch':{'types':"administrative_area_level_1"}}},{'_id':0,'address_components':{'$elemMatch':{'types':"administrative_area_level_1"}},'address_components.long_name':1,'address_components.short_name':1}):
        stateList.append(a['address_components'][0]['long_name'])
    client.close()
    stateList=list(set(stateList))
    return stateList

def getCoordinates(state):
    coordList=[]
    client = MongoClient()
    db = client.addcol
    acc = db.addDumps
    for a in acc.find({'address_components': {'$elemMatch': { 'long_name':state  ,'types': "administrative_area_level_1"}} },{"_id":0,"geometry.location":1 ,"formatted_address":1,"place_id":1}):
        coordList.append(dict(lat=a['geometry']['location']['lat'],lng=a['geometry']['location']['lng'],add=a['formatted_address'],place_id=a['place_id']))
    client.close()
    return json.dumps(coordList)

def getCityCord(city):
    coordList=[]
    client = MongoClient()
    db = client.addcol
    acc = db.addDumps
    for a in acc.find({'address_components': {'$elemMatch': { 'long_name':city  ,'types': "locality"}} },{"_id":0,"geometry.location":1 ,"formatted_address":1}):
        coordList.append((a['geometry']['location']['lat'],a['geometry']['location']['lng'],a['formatted_address']))
    client.close()
    print coordList
    coordList = convex_hull(coordList)
    pointy = []
    for p in coordList:
        temp = {}
        temp['lat']=p[0]
        temp['lng']=p[1]
        pointy.append(temp)
    return json.dumps(pointy)


def convertJson(dic):
    return json.dumps(dic)

def getPlaceIdData(place_id):
    client = MongoClient()
    db = client.addcol
    acc = db.addDumps
    placeDataJson = None
    for placeData in acc.find({'place_id':place_id},{"_id":0}):
        placeDataJson = json.dumps(placeData)
    client.close()
    return placeDataJson

def gridCoder(data):
    di = json.loads(data)
    n=float(di['gridData']['north'])
    s=float(di['gridData']['south'])
    e=float(di['gridData']['east'])
    w=float(di['gridData']['west'])
    dx=int(di['gridLatDiv'])
    dy=int(di['gridLngDiv'])
    gridMat = []
    a = s
    for i in range(dx+1):
        b = w
        for j in range(dy+1):
            gridMat.append(str(a)+', '+str(b))
            b += (e-w)/float(dx)
        a += (n-s)/float(dy)
    return gridMat   


def convex_hull(points):
    points = sorted(set(points))
    if len(points) <= 1:
        return points
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lower = []
    for p in points:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    upper = []
    for p in reversed(points):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]

