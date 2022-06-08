from datetime import date, timedelta, datetime
from operator import itemgetter
from datetime import datetime
import requests
import json
import pandas as pd
from pandas.io.json import json_normalize
import numpy as np
import sys



def getAnimalInfo(userLoc):

    begin_date = (date.today() - timedelta(days=10)).strftime("%Y%m%d")
    end_date = date.today().strftime("%Y%m%d")
    numOfRows = str(5000)

    url = 'http://openapi.animal.go.kr/openapi/service/rest/abandonmentPublicSrvc/abandonmentPublic?bgnde='+begin_date+'&endde='+end_date+'&numOfRows='+numOfRows+'&ServiceKey=SSp25i3dc5GkEAwqr6qrKHLAPS7aMZ%2FaKuVyMlE%2BqQ1irBnGaQNkbmm24XJF05S42SXMwQIIcIeC%2Bvm6IggUOQ%3D%3D&_type=json'
    params ={'serviceKey' : 'SSp25i3dc5GkEAwqr6qrKHLAPS7aMZ%2FaKuVyMlE%2BqQ1irBnGaQNkbmm24XJF05S42SXMwQIIcIeC%2Bvm6IggUOQ%3D%3D'}

    response = requests.get(url, params=params)
    animalInfo = response.content.decode('utf-8')

    json_animalInfo = json.loads(animalInfo)
    dict_animalInfo = json_animalInfo['response']['body']['items']['item']
    dataframe = json_normalize(dict_animalInfo)
    returnInfo = dataframe[dataframe['orgNm'].str.contains(userLoc)] # 사용자가 사는 (도 혹은 광역시/특별시)의 기관 정보만 반환

    return returnInfo

def getAnimalRecommend(userPreference, animalInfos):
    '''
    Input
        - userPreference [ list ] : user의 선호도 정보가 리스트 형태로 들어옴
        - animalInfos [ list ] : animalInfo가 리스트 형태로 들어옴
    Output
        - animalRecommend [ list ] : 추천 알고리즘에 의해 정렬된 순서대로 [점수, 동물 고유번호] 정보가 담긴 리스트
    '''
    # 파이썬 리스트 대응 정렬
    # https://bit.ly/3PBm81D
    animalRecommend = [] # [동물 API 정보 json 형태 + 리스트]
    animalScore = [] # 동물 API 정보를 대응 정렬 시키기 위한 score

    # 사용자의 선호도 정보 변수에 저장
    userBreed = userPreference[0] # 치와와
    userAge = int(userPreference[1]) # 2
    userSex = userPreference[2] # M / F
    userColor = userPreference[3] # 흰색, 노란색,,
    userType = userPreference[4] # 개, 고양이, 기타
    # userLoc = userPreference[4]

    # 각 동물들의 정보를 사용자 선호도 정보와 비교해가며 점수를 책정
    # 점수 책정 후에는 동물 고유값과 해당 동물의 점수를 묶어서 animalRecommend에 추가

    if len(animalInfos)>1:
        for index, animalInfo in animalInfos.iterrows():
            # 점수 초기화
            score = 0

            # 동물 정보 변수에 저장
            # print('animal breed : ', animalInfo['kindCd']) # ex) [개] 믹스견
            '''
            animalAge = datetime.today().year - int(animalInfo[0][0:4]) +1 # 한국식 나이 계산
            animalColor = animalInfo[5] # 색깔 정보는 전처리 필요
            animalBreed = animalInfo[10][4:]
            animalSex = '암컷' if animalInfo[19] == 'F' else '수컷' # 암컷, 수컷으로 변경
            '''
            animalAge = datetime.today().year - int(animalInfo['age'][0:4]) +1 # 한국식 나이 계산
            animalColor = animalInfo['colorCd'] # 색깔 정보는 전처리 필요
            animalBreed = animalInfo['kindCd'].split(' ')[1] # ex) 치와와
            animalType = animalInfo['kindCd'].split(' ')[0][1:-1] # ex) 개, 고양이
            animalSex = animalInfo['sexCd']

            if animalBreed == '한국':
                continue

            # print(userAge, animalAge)
            # print(userType, animalType)
            # print(userColor, animalColor)
            # print(userBreed, animalBreed)
            # print(userSex, animalSex)
            
            
            # animalSex = '암컷' if animalInfo['sexCd'] == 'F' else '수컷' # 암컷, 수컷으로 변경
            
            # 점수 책정
            if animalBreed == userBreed:
                score+=10000
            if animalType == userType:
                score+=1000
            else:
                score-=1000
            if animalSex == userSex:
                score+=100
            if animalColor == userColor:
                score+=100
            score-=abs(userAge-animalAge)*100 # 나이 차이가 많이 날수록 score가 낮아짐

            
            animalScore.append(score)
            animalRecommend.append([animalInfo['age'],animalInfo['careAddr'],animalInfo['careNm'],animalInfo['careTel'],animalInfo['chargeNm'],animalInfo['colorCd'],animalInfo['desertionNo'],animalInfo['filename'],animalInfo['happenDt'],animalInfo['happenPlace'],animalInfo['kindCd'],animalInfo['neuterYn'],animalInfo['noticeEdt'],animalInfo['noticeNo'],animalInfo['noticeSdt'],animalInfo['officetel'],animalInfo['orgNm'],animalInfo['popfile'],animalInfo['processState'],animalInfo['sexCd'],animalInfo['specialMark']])
            
    sorted_index_animalScore = np.argsort(animalScore)
    sorted_animalRecommend = [animalRecommend[i] for i in sorted_index_animalScore]
    # 위에꺼 설명
    # animalRecommend를 score가 높은 순으로 정렬
    # https://bit.ly/39GI9M2 (파이썬 다중 리스트 정렬)
    animalRecommend.sort(key=itemgetter(0), reverse=True)

    # animalScore와 animalRecommend를 대응 정렬
    # sorted_animalScore = np.sort(animalScore)
    # https://bit.ly/3PBm81D


    return sorted_animalRecommend
    
# 사용자 preference 정보
# https://needneo.tistory.com/95 
val_name = str(sys.argv[1])
val_userEmail = str(sys.argv[2])
val_breed = str(sys.argv[3])
val_age = str(sys.argv[4])
val_sex = str(sys.argv[5])
val_color = str(sys.argv[6])
val_type = str(sys.argv[7])
val_userLoc = str(sys.argv[8])


userPreference = [val_breed, val_age, val_sex, val_color, val_type, val_userLoc]
animalInfo = getAnimalInfo(userPreference[5].split(' ')[0]) # val_userLoc 정보를 이용해서 그 주변의 동물 정보 가져오기

animalRecommend = getAnimalRecommend(userPreference, animalInfo)

# 30개만 가져오기
# if len(animalRecommend)>30:
#     animalRecommend = animalRecommend[:30]

df = pd.DataFrame(animalRecommend, columns=['age','careAddr','careNm','careTel','chargeNm','colorCd','desertionNo','filename','happenDt','happenPlace','kindCd','neuterYn','noticeEdt','noticeNo','noticeSdt','officetel','orgNm','popfile','processState','sexCd','specialMark'])


js = df.to_json(orient='table', force_ascii=False)
print(js) # 반드시 출력해줘야함