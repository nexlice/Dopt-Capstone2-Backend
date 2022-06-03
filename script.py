from datetime import date, timedelta, datetime

begin_date = (date.today() - timedelta(days=10)).strftime("%Y%m%d")
end_date = date.today().strftime("%Y%m%d")


print(begin_date)
print(end_date)
# print(today)
# print(today - ten_days)