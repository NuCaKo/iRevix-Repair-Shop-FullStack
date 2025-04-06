import { motion } from 'framer-motion'

const TestimonialCarousel = ({ testimonials }) => {
    return (
        <div className="relative overflow-hidden">
            <div className="flex snap-x snap-mandatory overflow-x-auto pb-8">
                {testimonials.map((testimonial, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="flex-shrink-0 w-full md:w-1/2 px-4 snap-center"
                    >
                        <div className="bg-white p-8 rounded-2xl shadow-md">
                            <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                            <p className="font-semibold">{testimonial.author}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default TestimonialCarousel