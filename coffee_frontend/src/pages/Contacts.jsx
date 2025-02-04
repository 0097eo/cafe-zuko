import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Instagram,
  Facebook,
  Twitter,
} from 'lucide-react';

const ContactPage = () => {
  const contactInfo = [
    {
      icon: <Phone className="text-amber-600" size={24} />,
      title: "Phone",
      details: "+254 123 456 789",
      link: "tel:+254123456789"
    },
    {
      icon: <Mail className="text-amber-600" size={24} />,
      title: "Email",
      details: "hello@coffeehaven.com",
      link: "mailto:hello@coffeehaven.com"
    },
    {
      icon: <MapPin className="text-amber-600" size={24} />,
      title: "Location",
      details: "123 Ruiru Town, Kiambu",
      link: "https://maps.google.com"
    },
    {
      icon: <Clock className="text-amber-600" size={24} />,
      title: "Hours",
      details: "Mon-Fri: 8am - 6pm",
      link: null
    }
  ];

  const socialLinks = [
      { 
        icon: <Instagram size={24} />, 
        link: "https://www.instagram.com",
        name: "Instagram"
      },
      { 
        icon: <Facebook size={24} />, 
        link: "https://www.facebook.com",
        name: "Facebook"
      },
      { 
        icon: <Twitter size={24} />, 
        link: "https://twitter.com",
        name: "Twitter"
      }
    ];

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">Get in Touch</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Have questions about our coffee? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div className="bg-gray-900 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
            <form 
              className="space-y-6"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Contact form"
            >
              <div>
                <label htmlFor="name" className="block text-gray-400 mb-2">Name</label>
                <input
                  id="name"
                  type="text"
                  className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-700 focus:border-amber-600 focus:outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-400 mb-2">Email</label>
                <input
                  id="email"
                  type="email"
                  className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-700 focus:border-amber-600 focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-gray-400 mb-2">Message</label>
                <textarea
                  id="message"
                  className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-700 focus:border-amber-600 focus:outline-none h-32"
                  placeholder="Your message..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-500 transition-colors flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-gray-900 rounded-xl p-6 flex items-start gap-4">
                <div className="p-3 bg-gray-800 rounded-lg">{info.icon}</div>
                <div>
                  <h3 className="text-white font-bold mb-1">{info.title}</h3>
                  {info.link ? (
                    <a
                      href={info.link}
                      className="text-gray-400 hover:text-amber-600 transition-colors"
                    >
                      {info.details}
                    </a>
                  ) : (
                    <p className="text-gray-400">{info.details}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Social Links */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-800 rounded-lg text-amber-600 hover:text-amber-500 transition-colors"
                    aria-label={`Follow us on ${social.name}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;