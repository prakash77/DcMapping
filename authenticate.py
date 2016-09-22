from functools import wraps
from flask import request, Response

users={"dq":["dq@dq",["all"]]}

def check_auth(username, password, access):
    """This function is called to check if a username /
    password combination is valid.
    """
    u = users.get(username,None)
    if u:
        if u[0] == password and (access in u[1] or u[1][0]=="all"):
            return username and password
        else:
            return None
    else:
        return None

def authenticate():
    """Sends a 401 response that enables basic auth"""
    return Response(
    'Could not verify your access level for that URL.\n'
    'You have to login with proper credentials', 401,
    {'WWW-Authenticate': 'Basic realm="Login Required"'})

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        access = f.__name__
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password, access):
            return authenticate()
        return f(*args, **kwargs)
    return decorated 