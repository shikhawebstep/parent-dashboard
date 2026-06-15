// components/Payment.jsx

import React from 'react'
import { useLocation } from 'react-router-dom'

const Section = ({ title, children }) => (
  <div className="bg-white rounded-[30px] p-5 mb-4">
    <h2 className="text-[24px] font-semibold text-[#282829] mb-4">{title}</h2>
    {children}
  </div>
)

const Payment = () => {
  const { state } = useLocation()
  const booking = state?.booking

  if (!booking) {
    return (
      <div className="p-6 text-center bg-white rounded-[30px]">
        <p className="text-[#3c3c3d] font-medium">No booking details available.</p>
      </div>
    )
  }

  const { venue, paymentPlan, status, createdAt, id } = booking;
  const payments = booking?.payments?.length > 0
    ? booking.payments
    : booking?.payment
      ? [booking.payment]
      : []

  const details = [
    { label: 'Status', value: status ?? '-' },
    { label: 'ID', value: id ?? '-' },
    { label: 'Created', value: createdAt ? new Date(createdAt).toLocaleDateString('en-GB') : '-' },
    { label: 'Address', value: venue ? `${venue.name}, ${venue.address}` : booking.address || booking?.location },
    { label: 'Email', value: booking?.parents?.[0]?.parentEmail ?? '-' },
  ]

  const subscription = {
    plan: paymentPlan?.title ?? '-',
    price: paymentPlan ? `${(paymentPlan.price / 100).toFixed(2)} GBP` : '-',
  }

  return (
    <div className="min-h-screen">

      {/* Details */}
      <Section title="Details">
        {details.map((item, i) => (
          <div
            key={item.label}
            className={`flex justify-between items-start py-4 text-sm ${i < details.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <span className="text-[#717073] text-[16px] font-semibold w-32 shrink-0">{item.label}</span>
            <span className="text-[#282829] text-[16px] font-semibold capitalize text-right">{item.value}</span>
          </div>
        ))}
      </Section>

      {/* Subscription */}
      {

      }


      {
        booking.serviceType === "weekly class membership" && (
          <Section title="Subscription">
            <div className="flex justify-between items-center">
              <span className="text-[#282829] text-[16px] font-semibold">{subscription.plan}</span>
              <div className="flex items-center gap-3">
                <span className="text-[#282829] text-[16px] font-semibold">{subscription.price}</span>
                <button className="text-blue-500 text-[16px] font-semibold hover:text-blue-600">Change</button>
              </div>
            </div>
          </Section>

        )
      }
      {/* Payments */}
      <div className="bg-white rounded-[30px] py-5 mb-4">
        <h2 className="text-[24px] font-semibold text-[#282829] mb-4 px-5">Payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="bg-[#F5F5F5]">
                {['Status', 'Source', 'Charge', 'Paid out', 'Amount'].map((col) => (
                  <th key={col} className="text-left text-[16px] font-semibold text-gray-500 px-5 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments?.map((p) => {
                const amount = p.price ?? p.amount ?? '-'
                const currency = p.currency ?? '-'
                const status = p.paymentStatus ?? p.payment_status ?? '-'
                const date = p.createdAt ?? p.paymentDate ?? p.payment_date
                const chargeDate = date ? new Date(date).toLocaleDateString('en-GB') : '-'
                const description = p.description ?? p.gatewayResponse?.payment?.description ?? '-'
                const paymentType = p.paymentType ?? (p.stripePaymentIntentId ? 'stripe' : '-')
                const failed = status === 'failed'
                const isPending = status === 'pending' || status === 'pending_submission'

                return (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${failed ? 'bg-red-500' : isPending ? 'bg-yellow-400' : 'bg-green-500'}`} />
                        <span className="text-[16px] font-semibold text-[#282829]">
                          {p?.paymentStatus || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[16px] font-semibold text-gray-500 capitalize">
                      {p.paymentType ?? 'Stripe'}
                    </td>
                    <td className="px-5 py-3 text-[16px] font-semibold text-gray-800">{chargeDate}</td>
                    <td className="px-5 py-3 text-[16px] font-semibold text-gray-500 capitalize">
                      {p.paymentStatus ?? '-'}
                    </td>
                    <td className="px-5 py-3 text-[16px] font-semibold text-gray-800">
                      {amount} {p.currency}
                    </td>

                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default Payment