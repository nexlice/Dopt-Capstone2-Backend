import requests
import json
import pandas as pd
from pandas.io.json import json_normalize
from datetime import datetime, timedelta

def getAnimalInfo():

    bgnde = datetime.today() - timedelta(days = 30)
    #30일 전 날짜
    bgnde_Month_Start = bgnde.strftime("%Y%m%d")
    #오늘 날짜
    endde = datetime.today().strftime("%Y%m%d")

    # url 입력
    url = 'http://openapi.animal.go.kr/openapi/service/rest/abandonmentPublicSrvc/abandonmentPublic?bgnde='+str(bgnde_Month_Start)+'&endde='+str(endde)+'&numOfRows=25000&ServiceKey=SSp25i3dc5GkEAwqr6qrKHLAPS7aMZ%2FaKuVyMlE%2BqQ1irBnGaQNkbmm24XJF05S42SXMwQIIcIeC%2Bvm6IggUOQ%3D%3D&_type=json'
    response = requests.get(url)

    #데이터 값 출력해보기
    contents = response.text
    json_ob = json.loads(contents)
    body = json_ob['response']['body']['items']['item']
    dataframe = json_normalize(body)

    return dataframe

dataframe = getAnimalInfo()

#processState로 정렬
#processState에는 다음과 같은 정보가 있다.
# 보호중        5589
# 종료(자연사)     999
# 종료(반환)      790
# 종료(입양)      555
# 종료(안락사)     123
# 종료(기증)       28
# 종료(방사)        9
# 종료(기타)        1

#resultdata에는 각 processState의 요소별로 개수를 센다.
resultdata = dataframe['processState'].value_counts()
state_list = ['보호중', '종료(자연사)', '종료(반환)', '종료(입양)', '종료(안락사)', '종료(기증)', '종료(방사)', '종료(기타)']
data_list = []
index = 0
#https://ddolcat.tistory.com/676
for i in resultdata:
    #만약 해당 processState에 사전에 정한 리스트에 있으면 값을 저장한다.
    #이렇게 하는 이유는 특정 processState가 없을 수도 있기 때문..
	if resultdata.index[index] in state_list :
		data_list.append([index, resultdata.index[index],resultdata.values[index]])
	else :
		data_list.append([index, resultdata.index[index], 0])
	index = index + 1

#결과를 .json으로 저장하기
#https://www.delftstack.com/ko/howto/python-pandas/pandas-dataframe-to-json/
df = pd.DataFrame(data_list, columns=['index', 'processState', 'value'])
js = df.to_json(orient = 'table', force_ascii=False)
#print(js)
file_path = "./statistics.json"
df.to_json(file_path, orient = 'table', force_ascii=False)
