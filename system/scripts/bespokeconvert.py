from __future__ import print_function
import pickle
import os.path
import os
import cairosvg
import mysql.connector
import sys
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.http import MediaFileUpload
from mysql.connector import errorcode

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/drive.file']

"""config = {
  'user': 'root',
  'password': 'gymnast',
  'host': 'localhost',
  'port': '3306',
  'database': 'safetysigns_opencart_core',
  'raise_on_warnings': True
}
"""
config = {
  'user': 'safetysigns_sql',
  'password': 'fYUuAk0rbhjrMrVC',
  'host': 'localhost',
  'port': '3306',
  'database': 'safetysigns_opencart_core',
  'unix_socket': '/var/lib/mysql/mysql.sock',
  'raise_on_warnings': True
}

png_thumb_height = 100
png_main_height = 300
png_thumb_path = '/var/www/vhosts/safetysignsandnotices.co.uk/httpdocs/image/catalog/bespoke/thumbs/'
png_path = '/var/www/vhosts/safetysignsandnotices.co.uk/httpdocs/image/catalog/bespoke/'
pdf_temp_path = '/var/www/vhosts/safetysignsandnotices.co.uk/httpdocs/system/scripts/tmp/'

def main(order_id):
    #get all the bespoke products
    file_id_list = []
    bespoke_product_arr = get_bespoke_order(order_id)
    if len(bespoke_product_arr) > 0:
        for bespoke_row in bespoke_product_arr:
            bespoke_filename = bespoke_row.png_url[:-4]
            tmp_pdf_filename = create_pdf(bespoke_row.svg_export, bespoke_filename)
            create_png(bespoke_row.svg_export, bespoke_row.png_url)
            file_id_list.append(google_drive_upload(bespoke_filename+'.pdf', tmp_pdf_filename))
    print(file_id_list)


def setup_googleservice():
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server()
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    return creds


def google_drive_upload(pdf_file_name, path_to_temp_pdf):
    creds = setup_googleservice()
    service = build('drive', 'v3', credentials=creds)
    bespoke_folder = '17j8QvHVkdHHLcB23AUX8MarXD7RE6sRa'
    file_metadata = {
        'name': pdf_file_name, 'parents': [bespoke_folder]
    }
    media = MediaFileUpload(path_to_temp_pdf,
                            mimetype='application/pdf')
    file = service.files().create(body=file_metadata,
                                  media_body=media,
                                  fields='id').execute()
#    remove_temp_file(path_to_temp_pdf)
    return file.get('id')


def create_pdf(svg_raw, svg_filename):
    tmp_filename = pdf_temp_path+svg_filename+'-tmp.pdf'
    cairosvg.svg2pdf(bytestring=svg_raw, write_to=tmp_filename)

    return tmp_filename


def create_png(svg_raw, svg_thumb_name):
    cairosvg.svg2png(bytestring=svg_raw, write_to=png_thumb_path+svg_thumb_name, dpi=300, output_height=png_thumb_height)
    cairosvg.svg2png(bytestring=svg_raw, write_to=png_path+svg_thumb_name, dpi=300, output_height=png_main_height)


def remove_temp_file(tmp_name):
    if os.path.exists(tmp_name):
        os.remove(tmp_name)


def get_bespoke_order(order_id):
    try:
        cnx = mysql.connector.connect(**config)
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Something is wrong with your user name or password")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist")
        else:
            print(err)
    else:
        cur = cnx.cursor(named_tuple=True)
        orderno = (order_id,)
        sql = "SELECT \
        ssan_order_bespoke_image.id, \
        ssan_order_bespoke_image.svg_export, \
        ssan_order_bespoke_image.png_url \
        FROM oc_order_product INNER JOIN ssan_order_bespoke_image ON oc_order_product.order_product_id = ssan_order_bespoke_image.order_product_id \
        WHERE oc_order_product.order_id = %s"
        cur.execute(sql, orderno)
        cart_rows = cur.fetchall()
        cnx.close()
        return cart_rows

count = 0
order_id = 0
for arg in sys.argv:
    if arg == "-order":
        order_id = sys.argv[count+1]
    count += 1
if int(order_id) > 0:
    main(order_id)

