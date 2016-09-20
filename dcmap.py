from flask import Flask, request, flash, url_for, redirect, render_template
import helper
from authenticate import requires_auth

app = Flask(__name__)

@app.route('/')
def index():
    cities = helper.getCityList()
    cities.sort()
    return render_template('dcmapping.html',cities=cities)

@app.route('/city_dc')
def getCity():
    return redirect(url_for('index'))

if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0')
