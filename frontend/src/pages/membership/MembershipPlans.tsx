import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, Crown, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/button';
import Badge from '../../components/ui/badge';

const plans = [
  {
    name: 'Starter',
    price: 29.99,
    period: '/month',
    description: 'Perfect for getting started',
    features: ['Gym access (6am-10pm)', 'Basic workout plans', 'Locker & shower access', 'Mobile app access', '1 guest pass/month'],
    popular: false,
    icon: Zap,
    color: 'from-slate-500 to-slate-600',
  },
  {
    name: 'Pro',
    price: 59.99,
    period: '/month',
    description: 'For dedicated fitness enthusiasts',
    features: ['24/7 gym access', 'All workout programs', 'Unlimited classes', 'Personal coach (2x/month)', 'Nutrition planning', 'Priority support', '5 guest passes/month'],
    popular: true,
    icon: Star,
    color: 'from-primary-600 to-emerald-600',
  },
  {
    name: 'Elite',
    price: 99.99,
    period: '/month',
    description: 'The ultimate fitness experience',
    features: ['Everything in Pro', 'Unlimited personal coaching', 'Custom meal plans', 'Recovery & massage', 'Priority booking', 'Exclusive events', 'Family access (up to 3)', 'Free merchandise pack'],
    popular: false,
    icon: Crown,
    color: 'from-purple-600 to-pink-600',
  },
];

export default function MembershipPlans() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="page-title">Choose Your Plan</h1>
        <p className="text-dark-400 mt-2 max-w-lg mx-auto">Unlock your full potential with the right membership. Upgrade anytime.</p>
        <div className="flex items-center justify-center gap-2 mt-6 bg-dark-800 p-1 rounded-lg w-fit mx-auto">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billing === 'monthly' ? 'bg-primary-600 text-white' : 'text-dark-300'}`}
          >Monthly</button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billing === 'yearly' ? 'bg-primary-600 text-white' : 'text-dark-300'}`}
          >Yearly <Badge variant="green" className="ml-1">Save 20%</Badge></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`card-hover relative overflow-hidden ${plan.popular ? 'border-primary-500/50 ring-1 ring-primary-500/20' : ''}`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0">
                <div className="bg-primary-600 text-white text-[10px] font-bold px-8 py-1 -mr-8 mt-3 rotate-45">POPULAR</div>
              </div>
            )}
            <div className="p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                <plan.icon size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-sm text-dark-400 mt-1">{plan.description}</p>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold">${billing === 'yearly' ? (plan.price * 10).toFixed(0) : plan.price}</span>
                <span className="text-dark-400 text-sm">{billing === 'yearly' ? '/year' : plan.period}</span>
                {billing === 'yearly' && <p className="text-xs text-green-400 mt-1">${plan.price}/month billed annually</p>}
              </div>
              <Button variant={plan.popular ? 'primary' : 'secondary'} className="w-full">
                {plan.popular ? 'Start Free Trial' : 'Get Started'} <ArrowRight size={16} />
              </Button>
              <div className="mt-6 space-y-3">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <Check size={16} className="text-primary-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-dark-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 max-w-3xl mx-auto card p-6 text-center">
        <h3 className="font-semibold mb-2">Enterprise & Corporate Plans</h3>
        <p className="text-sm text-dark-400 mb-4">Custom plans for businesses, teams, and organizations. Volume pricing available.</p>
        <Button variant="secondary">Contact Sales</Button>
      </div>
    </div>
  );
}
