from flask import Flask, render_template
from selenium.webdriver.chrome.options import Options
from  selenium import webdriver
from bs4 import BeautifulSoup
import requests
import csv
app = Flask(__name__)

@app.route('/home/<title>/', methods=['GET'])
def index(title):
    print(title)

    chrome_options = Options()
    chrome_options.add_argument("--headless")
    driver = webdriver.Chrome('C:/Users/vinit/Downloads/chromedriver_win32/chromedriver.exe',options=chrome_options)
    HEADERS = {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0", "Accept-Encoding":"gzip, deflate", "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "DNT":"1","Connection":"close", "Upgrade-Insecure-Requests":"1"}

    url = 'https://www.amazon.in/s?k='
    search = title
    URL = url+search
    driver.get(URL)

    soup = BeautifulSoup(driver.page_source, "lxml")
    price = soup.find("span",attrs={"class":'a-price-whole'}) # to get the price
    symbol = soup.find("span",attrs={"class":'a-price-symbol'}) #to check if it is $ or INR
    symbol = symbol.text
    priceINR = price.text
    print(priceINR)

    if(symbol == '$'):
        val = int(float(priceINR))
        priceINR = int(float(val*74))

    print(priceINR)
    return str(priceINR)


if __name__ == "__main__":
    app.run(port=3000, debug=True)