import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const clothingSizes = [
  { size: 'XS', bust: '80-84', waist: '60-64', hips: '86-90' },
  { size: 'S', bust: '84-88', waist: '64-68', hips: '90-94' },
  { size: 'M', bust: '88-92', waist: '68-72', hips: '94-98' },
  { size: 'L', bust: '92-96', waist: '72-76', hips: '98-102' },
  { size: 'XL', bust: '96-100', waist: '76-80', hips: '102-106' },
];

const shoeSizes = [
  { eu: '36', us: '5.5', uk: '3.5', cm: '23' },
  { eu: '37', us: '6.5', uk: '4.5', cm: '23.5' },
  { eu: '38', us: '7.5', uk: '5', cm: '24' },
  { eu: '39', us: '8', uk: '5.5', cm: '24.5' },
  { eu: '40', us: '9', uk: '6.5', cm: '25' },
  { eu: '41', us: '10', uk: '7.5', cm: '26' },
];

export default function SizeGuide() {
  return (
    <div className="section-padding">
      <div className="max-w-4xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-12">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">Size Guide</h1>
          <p className="text-text-light">Find your perfect fit</p>
        </motion.div>

        {/* How to Measure */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="card mb-8">
          <h2 className="font-heading text-xl font-bold mb-4">How to Measure</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-sm text-text-light">
            <div>
              <h3 className="font-semibold text-text mb-1">Bust</h3>
              <p>Measure around the fullest part of your chest, keeping the tape horizontal.</p>
            </div>
            <div>
              <h3 className="font-semibold text-text mb-1">Waist</h3>
              <p>Measure around your natural waistline, the narrowest part of your torso.</p>
            </div>
            <div>
              <h3 className="font-semibold text-text mb-1">Hips</h3>
              <p>Measure around the fullest part of your hips and buttocks.</p>
            </div>
          </div>
        </motion.div>

        {/* Clothing Sizes */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12">
          <h2 className="font-heading text-xl font-bold mb-4">Clothing Sizes (cm)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/5">
                  <th className="text-left p-3 font-semibold">Size</th>
                  <th className="text-left p-3 font-semibold">Bust</th>
                  <th className="text-left p-3 font-semibold">Waist</th>
                  <th className="text-left p-3 font-semibold">Hips</th>
                </tr>
              </thead>
              <tbody>
                {clothingSizes.map((s, i) => (
                  <tr key={s.size} className={i % 2 === 0 ? 'bg-white' : 'bg-bg'}>
                    <td className="p-3 font-medium">{s.size}</td>
                    <td className="p-3 text-text-light">{s.bust}</td>
                    <td className="p-3 text-text-light">{s.waist}</td>
                    <td className="p-3 text-text-light">{s.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Shoe Sizes */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="font-heading text-xl font-bold mb-4">Shoe Sizes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/5">
                  <th className="text-left p-3 font-semibold">EU</th>
                  <th className="text-left p-3 font-semibold">US</th>
                  <th className="text-left p-3 font-semibold">UK</th>
                  <th className="text-left p-3 font-semibold">CM</th>
                </tr>
              </thead>
              <tbody>
                {shoeSizes.map((s, i) => (
                  <tr key={s.eu} className={i % 2 === 0 ? 'bg-white' : 'bg-bg'}>
                    <td className="p-3 font-medium">{s.eu}</td>
                    <td className="p-3 text-text-light">{s.us}</td>
                    <td className="p-3 text-text-light">{s.uk}</td>
                    <td className="p-3 text-text-light">{s.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
