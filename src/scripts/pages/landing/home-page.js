export default class HomePage {
  async render() {
    return `
      <section class="landing" id="landingSection" aria-labelledby="landing-heading">
        <div class="landing-content">
          <div class="landing-text">
            <h1 id="landing-heading">Selamat Datang di Book App</h1>
            <p>
              Temukan dan dapatkan buku favorit Anda dengan mudah melalui Book
              App platform terpercaya untuk jual beli buku fisik dan digital,
              lengkap, cepat, dan aman dalam satu genggaman.
            </p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {}
}
