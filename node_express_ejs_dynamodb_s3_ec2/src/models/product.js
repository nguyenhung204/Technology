
export default class Product {
  constructor({ id, name, price, quantity, url_image }) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
    this.url_image = url_image;
  }

  static fromForm(form, imageUrl) {
    return new Product({
      id: crypto.randomUUID(),
      name: form.name,
      price: Number(form.price),
      quantity: Number(form.quantity),
      url_image: imageUrl
    });
  }

  static fromDynamo(item) {
    return new Product(item);
  }
}
