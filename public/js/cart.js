// Wait for the document to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get all the remove product buttons
  var removeButtons = document.querySelectorAll(".remove-product");

  // Get the checkout button
  var checkoutButton = document.querySelector(".checkout");

  // Attach event listener to the checkout button
  checkoutButton.addEventListener("click", function () {
    // Redirect to the checkout page
    window.location.href = "checkout";
  });

  // Attach event listeners to each remove button
  removeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      // Get the parent product element
      var product = button.parentElement.parentElement;

      // Remove the product from the cart
      product.remove();

      // Update the cart totals
      updateCartTotals();
    });
  });

  // Get all the quantity input elements
  var quantityInputs = document.querySelectorAll(".product-quantity input");

  // Attach event listeners to each quantity input
  quantityInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      // Update the line price for the product
      updateLinePrice(input);

      // Update the cart totals
      updateCartTotals();
    });
  });

  // Function to update the line price for a product
  function updateLinePrice(quantityInput) {
    var product = quantityInput.parentElement.parentElement;
    var price = parseFloat(product.querySelector(".product-price").textContent);
    var quantity = parseInt(quantityInput.value);
    var linePrice = price * quantity;
    product.querySelector(".product-line-price").textContent =
      linePrice.toFixed(2);
  }

  // Function to update the cart totals
  function updateCartTotals() {
    var products = document.querySelectorAll(".product");

    var subtotal = 0;
    products.forEach(function (product) {
      var linePrice = parseFloat(
        product.querySelector(".product-line-price").textContent
      );
      subtotal += linePrice;
    });

    var taxRate = 0.05;
    var tax = subtotal * taxRate;

    var shipping = 15.0;

    var total = subtotal + tax + shipping;

    document.getElementById("cart-subtotal").textContent = subtotal.toFixed(2);
    document.getElementById("cart-tax").textContent = tax.toFixed(2);
    document.getElementById("cart-shipping").textContent = shipping.toFixed(2);
    document.getElementById("cart-total").textContent = total.toFixed(2);
  }
});
