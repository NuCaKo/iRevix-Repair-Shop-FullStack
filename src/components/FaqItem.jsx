import { motion, AnimatePresence } from 'framer-motion'

const FaqItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className="border rounded-xl overflow-hidden">
            <button
                onClick={onClick}
                className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <h3 className="text-lg font-semibold">{question}</h3>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 py-4 bg-white"
                    >
                        <p className="text-gray-600">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default FaqItem