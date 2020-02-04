from __future__ import print_function
import mysql.connector as mariadb
from mysql.connector import errorcode

config = {
  'user': 'safetysigns_sql',
  'password': 'fYUuAk0rbhjrMrVC',
  'host': 'localhost',
  'port': '3306',
  'database': 'safetysigns_opencart_core',
  'unix_socket': '/var/lib/mysql/mysql.sock',
  'raise_on_warnings': True
}

try:
    cnx = mariadb.connect(**config)
except mariadb.Error as err:
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
    print(cart_rows)

