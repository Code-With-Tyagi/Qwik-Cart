import React, { useState, useMemo } from 'react';
import { FaChevronDown, FaEnvelope, FaHeadset } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// E-commerce FAQ Data
const faqData = [
  {
    category: "Orders & Tracking",
    question: "How do I track my order?",
    answer: "Once your order has shipped, you will receive an email with a tracking number and a link to track your package. You can also view your order status by logging into your account and visiting the 'My Orders' section."
  },
  {
    category: "Orders & Tracking",
    question: "Can I cancel or change my order?",
    answer: "We process orders quickly to ensure fast delivery. If you need to cancel or modify your order, please contact our support team within 1 hour of placing it. Once processing has started, we cannot make changes, but you can return the items later."
  },
  {
    category: "Shipping & Delivery",
    question: "How long does shipping take?",
    answer: "Standard domestic shipping typically takes 3-5 business days. Expedited shipping options (1-2 business days) are available at checkout. International shipping times vary by destination, usually ranging from 7-14 business days."
  },
  {
    category: "Shipping & Delivery",
    question: "Do you ship internationally?",
    answer: "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times are calculated at checkout based on your location. Please note that customs duties or import taxes may apply depending on your country's regulations."
  },
  {
    category: "Returns & Refunds",
    question: "What is your return policy?",
    answer: "We offer a 30-day hassle-free return policy. If you are not completely satisfied with your purchase, you can return it within 30 days of delivery for a full refund or exchange. Items must be unworn, unwashed, and in their original packaging."
  },
  {
    category: "Returns & Refunds",
    question: "How do I initiate a return?",
    answer: "To start a return, log into your account, go to 'My Orders', and select 'Return Item' next to the product. You will receive a prepaid return shipping label and instructions on how to send the item back to us."
  },
  {
    category: "Payments",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, and Google Pay. All payments are processed securely through our encrypted payment gateway."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  
  // FIXED: Added the missing state variables required by your JSX below
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // FIXED: Added the filteredFaqs logic required by your JSX below
  const filteredFaqs = useMemo(() => {
    return faqData.filter(faq => {
      const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
      const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 max-w-2xl mx-auto">
            Find answers to common questions about our products, shipping, returns, and more. 
            If you need further assistance, our support team is here to help.
          </p>
        </div>

        {/* FAQ Accordion Section */}
          <div className="lg:col-span-8 space-y-1">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <div 
                    key={index} 
                    className={`relative pl-6 transition-all duration-300 ${
                      isOpen ? "bg-zinc-50/40" : "hover:bg-zinc-50/20"
                    }`}
                  >
                    {/* Ultra-slick sliding indicator bar on the active element */}
                    <span className={`absolute left-0 top-0 bottom-0 w-0.5 bg-zinc-900 origin-top transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
                    }`} />

                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full flex items-center justify-between py-6 text-left group focus:outline-none cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <div className="pr-6">
                        {activeCategory === "All" && (
                          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                            {faq.category}
                          </span>
                        )}
                        <h3 className={`text-lg font-medium transition-colors duration-300 ${
                          isOpen ? "text-zinc-900" : "text-zinc-800 group-hover:text-zinc-900"
                        }`}>
                          {faq.question}
                        </h3>
                      </div>
                      
                      {/* Springy Arrow Indicator */}
                      <span className="shrink-0 ml-4">
                        <svg 
                          className={`w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            isOpen ? "rotate-180 text-zinc-900" : "rotate-0"
                          }`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth="1.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </span>
                    </button>

                    {/* Smooth height calculation container */}
                    <div 
                      className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-zinc-500 text-base leading-relaxed max-w-2xl font-light">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center">
                <p className="text-zinc-400 text-base font-light">No queries matched "{searchQuery}".</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-xs font-bold text-zinc-900 uppercase tracking-widest border-b border-zinc-900 pb-0.5 hover:text-sky-600 hover:border-sky-600 transition-colors cursor-pointer outline-none"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

        {/* Contact Support Footer Card */}
        <div className="mt-12 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 p-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
          <div className="mb-6 sm:mb-0">
            <h3 className="text-lg font-bold text-zinc-900 flex items-center justify-center sm:justify-start gap-2 mb-2">
              <FaHeadset className="text-zinc-400" />
              Still have questions?
            </h3>
            <p className="text-sm text-zinc-500">
              Can't find the answer you're looking for? Our support team is ready to help.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors duration-300 active:scale-95 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <FaEnvelope size={14} />
            Contact Support
          </Link>
        </div>

      </div>
    </div>
  );
};

export default FAQ;