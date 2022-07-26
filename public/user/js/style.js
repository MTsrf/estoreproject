// add to cart product
{
    // function addToCart(proId){
    //     $.ajax({
    //         url:'/add-to-cart/'+proId,
    //         method: 'get',
    //         success: (response) =>{
    //             console.log(response)
    //         }

    //     })
    // }


    function addToCart(proId, price, sellerId) {
        $.ajax({
            url: '/add-to-cart',
            data: {
                product: proId,
                price: price,
                seller: sellerId,
            },
            method: 'post',
            success: (response) => {
                if (response.success) {
                    Swal.fire({
                        position: 'bottom',
                        title: 'Item Added to Cart',
                        showConfirmButton: false,
                        timer: 1500,

                    })
                }

            }

        })
    }


    function addWhislist(productId) {
        $.ajax({
            url: '/add-to-whislist',
            data: {
                product: productId,
            },
            method: 'post',
            success: (response) => {
                console.log(response);
                if (response.status) {
                    Swal.fire({
                        position: 'bottom',
                        title: 'Added to Whislist',
                        showConfirmButton: false,
                        timer: 1500,

                    })
                } else {
                    Swal.fire({
                        position: 'bottom',
                        title: 'Item Removed from the whislist',
                        showConfirmButton: false,
                        timer: 1500
                    })
                }
            }
        })
    }


    //deleteAddress user
    function deleteAddress(id) {
        console.log(id);
        $.ajax({
            url: '/delete_address/' + id,
            method: 'get',
            success: (response) => {
                console.log(response);
                if (response.status) {
                    $(".changeprofile").load(window.location.href + " .changeprofile");
                }

            }
        })
    }


    function removeWhislist(productId) {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't Delete this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    $.ajax({
                        url: '/add-to-whislist',
                        data: {
                            product: productId,
                        },
                        method: 'post',
                        success: (response) => {
                            location.reload()
                        }
                    })
                )
            }
        })

    }
    function changeQuantity(cartId, productId, price, productname, cash, stock, count) {
        let stocks = parseInt(stock)
        let quantity = parseInt(document.getElementById(productId).innerHTML)
        // let amount = parseInt(document.getElementById(productname).innerHTML)
        count = parseInt(count)
        let datas=quantity+count
        var data 
        // console.log(datas);
        function qunatityChecking(q,d) {
            return data = q+d

        }
        if (datas <= stocks && 1 <= datas) {
            $("#productError").css("display", "none")
            
            $.ajax({
                url: '/change-product-quantity',
                data: {
                    cart: cartId,
                    product: productId,
                    count: count,
                    price: price,
                    quantity: quantity,
                },
                method: 'post',
                success: (response) => {
                    if (response.removeProduct) {
                        console.log('hai');
                        swal({
                            position: 'bottom-end',
                            icon: 'success',
                            title: 'Product Removed from the Cart',
                            showConfirmButton: false,
                            timer: 1500
                        })
                        location.reload()
                    } else {
                        var sum = quantity + count
                        console.log('ivide undo');
                        datas=quantity+count
                        console.log(datas);
                        
                        console.log(response);
                       
                        document.getElementById(productId).innerHTML =  qunatityChecking(quantity,count)
                        document.getElementById(productname).innerHTML = cash * sum
                        document.getElementById('total').innerHTML = response.data[0].total
                    }
                }
            })
        }else if(count == -1 && datas>=1){
            document.getElementById(productId).innerHTML = qunatityChecking(quantity,count)
        }else if(datas==0 ){
            console.log('error');
        }else{
            console.log(datas);
            console.log(data);
            console.log('second true');
            $("#productError").css("display", "block")
            $("#productError").text('Out of Stock')
        }


    }




    function deleteCartItem(cartId, productId) {
        swal({
            title: "Are you sure?",
            text: "You want delete this!",
            icon: "warning",
            showCancelButton: true,
            buttons: true,
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        })
            .then((willDelete) => {
                if (willDelete) {
                    $.ajax({
                        url: '/delete-cartItem',
                        data: {
                            cart: cartId,
                            product: productId,
                        },
                        method: 'post',
                        success: (response) => {
                            location.reload()
                        }
                    })
                } else {
                    swal("Your file is safe!");
                }
            });
    }
    ///edit inforamtions
    function editInfo() {
        document.getElementById('bio').disabled = false,
            document.getElementById('dob').disabled = false,
            document.getElementById('country').disabled = false,
            document.getElementById('info-btn').style.display = 'block'
    }





    // //orderTrackig Ajax
    // function orderTrackig(orderId,productId) {
    //     $.ajax({
    //         url:'/order-tracking/'+orderId + '/' + productId,
    //         method:'get',
    //         success:(response)=>{

    //         }
    //     })
    // }


    //order Tracking post method
    // function orderTrackig(orderId, cartId, userId, productId, addressId) {
    //     $.ajax({
    //         url: '/order-tracking',
    //         method: 'post',
    //         data: {
    //             order: orderId,
    //             cart: cartId,
    //             user: userId,
    //             product: productId,
    //             address: addressId
    //         },
    //         success: (response) => {
    //             if (response.success) {
    //                 location.href = '/tracking-details'
    //             }
    //         }
    //     })
    // }

    //changepassword in user
    $('#changePasswordUser').validate({
        rules: {
            password: {
                required: true,
                minlength: 8,
            },
            password1: {
                minlength: 8,
                equalTo: '#pass'
            }
        },
        submitHandler: function (form) {
            $.ajax({
                url: '/changePasswordUser',
                method: 'post',
                data: $(form).serialize(),
                success: (response) => {
                    if (response.status) {
                        Swal.fire({
                            position: 'top-end',
                            icon: 'success',
                            title: 'Your Password has been Changed',
                            showConfirmButton: false,
                            timer: 1000
                        })
                        location.reload()
                    } else {
                        $("#passwordchange-err").text('Your entered incorrect Password')
                    }
                }
            })
        }
    })

    $('#infoForm').submit((e) => {
        e.preventDefault()
        $.ajax({
            url: '/information_change',
            method: 'post',
            data: $("#infoForm").serialize(),
            success: (respone) => {
                if (respone.status) {
                    location.reload()
                }
            }
        })
    })

    //Search form in User
    $('#search-form').submit((e) => {
        e.preventDefault()
        $.ajax({
            url: '/search_product',
            method: 'post',
            data: $("#search-form").serialize(),
            success: (response) => {
                if (response.status) {
                    console.log(response);
                    location.href = '/all_products'
                }
            }
        })
    })

    function check(id) {
        // document.getElementById(id).click();
        // document.getElementById(id).checked =true
        // if (id) {
        //     document.getElementById(id).checked = true
        // }

        // if (id) {
        //     location.href = '/all_products'
        //     document.getElementById(id).click()
        //     console.log(id);
        // }
        $.ajax({
            url: '/category-products/' + id,
            method: 'get',
            success: (response) => {
                console.log(response);
                if (response.status) {
                    location.href = '/getCategoryData'
                }
            }
        })
    }
    $('input[name=category]').change(function () {
        $.ajax({
            url: '/search-filter',
            method: 'post',
            data: $('#filter').serialize(),
            success: (response) => {
                console.log(response);
                if (response.status) {
                    $("#products_filter").load(window.location.href + " #products_filter");
                    $('#prlen').text(response.len);
                }

            }
        })
    })



    $('input[name=brand]').change(function () {
        $.ajax({
            url: '/search-filter',
            method: 'post',
            data: $('#filter').serialize(),
            success: (response) => {
                console.log(response);
                if (response.status) {
                    $("#products_filter").load(window.location.href + " #products_filter");
                    $('#prlen').text(response.len);
                }
            }
        })
    })



    //price filter
    $('input[name=price]').change(function () {
        $.ajax({
            url: '/search-filter',
            method: "post",
            data: $('#filter').serialize(),
            success: (response) => {
                console.log(response);
                if (response.status) {
                    $("#products_filter").load(window.location.href + " #products_filter");
                    $('#prlen').text(response.len);
                }
            }
        })
    })



    // sort menu
    $('#sortMenu').on('change', function () {
        // alert( this.value );
        $.ajax({
            url: '/search-filter',
            method: "post",
            data: $('#filter').serialize(),
            success: (response) => {
                console.log(response.len);
                if (response.status) {
                    $("#products_filter").load(window.location.href + " #products_filter");
                    $('#prlen').text(response.len);
                }
            }
        })
    });


    //Order cancel
    function cancelOrder(cancelid, productId) {
        console.log('hai')
        $.ajax({
            url: '/cancelOrder',
            method: 'post',
            data: {
                order: cancelid,
                product: productId,
            },
            success: (response) => {
                console.log(response)
                if (response.status) {
                    location.reload()
                }
            }
        })
    }




    // $("#proceedToCheckout").click(function(e){
    //     e.preventDefault();
    //     $.ajax({
    //         url:'/checkout',
    //         method:'get',
    //         success:(response)=>{

    //         }
    //     })
    // })



    // function checkoutProduct(){
    //     let fname = document.getElementById('first').value;
    //     let lname = document.getElementById('last').value;
    //     let phone_number = document.getElementById('number').value;
    //     let email = document.getElementById('email').value;
    //     let address1 = document.getElementById('add1').value;
    //     let address2 = document.getElementById('add2').value;
    //     let city = document.getElementById('city').value;
    //     let district = document.getElementById('district').value;
    //     let pincode = document.getElementById('zip').value;
    //     let message = document.getElementById('message').value;


    //     console.log(fname);
    // }

    // $(document).ready(function() {
    //     $("#addressForm").validate({
    //         submitHandler: function (form) {
    //             $.ajax({
    //                 url: '/checkout-product',
    //                 method: 'post',
    //                 data: $(form).serialize(),
    //                 success: (response) => {
    //                     if (response.codSuccess) {
    //                         location.href = '/success'
    //                     }else{
    //                         console.log("ibfsdfjkld"+response);
    //                         razorpayPayment(response)
    //                     }
    //                 }

    //             })
    //         }
    //     })

    // })




    // function razorpayPayment(order){
    //     var options = {
    //         "key": "rzp_test_CXL1fP2ACnnSAC", // Enter the Key ID generated from the Dashboard
    //         "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    //         "currency": "INR",
    //         "name": "eStore Shop",
    //         "description": "Test Transaction",
    //         "image": "https://example.com/your_logo",
    //         "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    //         "handler": function (response){
    //             alert(response.razorpay_payment_id);
    //             alert(response.razorpay_order_id);
    //             alert(response.razorpay_signature);
    //             console.log('verifypayment');
    //             console.log(response);
    //             console.log(order);
    //             verifyPayment(response,order)

    //         },
    //         "prefill": {
    //             "name": "Gaurav Kumar",
    //             "email": "gaurav.kumar@example.com",
    //             "contact": "9999999999"
    //         },
    //         "notes": {
    //             "address": "Razorpay Corporate Office"
    //         },
    //         "theme": {
    //             "color": "#3399cc"
    //         }
    //     };
    //     var rzp1 = new Razorpay(options);
    //     rzp1.open();
    // }

    // function verifyPayment(payment,order){
    //     console.log("payments");
    //     console.log(payment);
    //     $.ajax({
    //         url:'/verify-payment',
    //         data:{
    //             payment:payment,
    //             order:order,
    //         },
    //         method:'post',
    //     })
    // }



}