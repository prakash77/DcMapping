from flask import Flask, request, flash, url_for, redirect, render_template
import helper
from authenticate import requires_auth

app = Flask(__name__,static_url_path='/dashboard')
app.secret_key = 'prakash'

@app.route('/dashboard/')
def index():
    return redirect(url_for('dcmap')

@app.route('/dashboard/dcmap')
@requires_auth
def dcmap():
    cities = helper.getCityList()
    cities.sort()
    return render_template('dcmapping.html',cities=cities)

@app.route('/dashboard/city_dc',methods=['POST'])
def get_dc():
    city = request.get_data()
    dc_data = helper.getLocDCData(city)
    return dc_data

if __name__ == "__main__":
    # app.debug = True
    app.run()
