<script>


gtag('event', 'purchase', {
    "transaction_id": "<?php echo $data_layer_order_data['order_id']; ?>",
    "value": <?php echo $data_layer_order_data['total'];  ?>,
    "currency": "GBP",
    "items": [
    <?php foreach($data_layer_order_data['products'] as $product) { ?>
        {
            "id": "<?php echo $product['product_id'];  ?>",
            "name": "<?php echo $product['name'];  ?>",
            "variant": "<?php echo $product['product_variant_id'];  ?>",
            "list_position": 1,
            "quantity": 2,
            "price": '<?php echo $product['price'];  ?>'
        },
<?php } ?>

    ]
});





dataLayer.push({
    'event' : 'SSANTransactionADS',
    'ecommerce': {
        'purchase': {
            'actionField': {
                'id': '<?php echo $data_layer_order_data['order_id']; ?>',
                'revenue': '<?php echo $data_layer_order_data['total'];  ?>'

            },
            'products': [
            <?php foreach($data_layer_order_data['products'] as $product) { ?>
    {
        'name': '<?php echo $product['name'];  ?>',
        'id': '<?php echo $product['product_id'];  ?>',
        'price': '<?php echo $product['price'];  ?>',
        'variant': '<?php echo $product['product_variant_id'];  ?>',
        'quantity': '<?php echo $product['quantity'];  ?>',
        'dimension1': '<?php echo $product['size_name'];  ?>',
        'dimension2': '<?php echo $product['material_name'];  ?>'
    },
<?php } ?>
]
}
}
});


</script>
