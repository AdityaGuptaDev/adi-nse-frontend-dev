import React from 'react';

const AlertsDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-300 p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800">Alerts for LAKSHMI SINHA</h1>
        <div className="flex gap-4">
          <button className="text-blue-600 hover:underline">Set New Insurance Alert</button>
          <span className="text-gray-600">|</span>
          <button className="text-blue-600 hover:underline">Set New SIP/STP Alert</button>
          <span className="text-gray-600">|</span>
          <button className="text-blue-600 hover:underline">Set New Customized Alert</button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Insurance Alerts Section */}
        <div className="bg-white border border-gray-300">
          <div className="bg-gray-200 p-2">
            <h2 className="font-semibold text-gray-800">My Insurance Alerts</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">SNo</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Date Added</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Investor</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Ins Type / Ins Plan</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Ins Company /<br />Policy No</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Sum Assured<br />(Rupees)</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Premium<br />(Rupees)</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Policy Term<br />(Years)</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Premium Frequency</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">First Installment<br />Date</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Expiry On</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={12} className="border border-gray-300 p-8 text-center">
                    <div className="text-gray-600">
                      <p className="mb-2">No Insurance Alerts found.</p>
                      <button className="text-blue-600 hover:underline">[ Create ]</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SIP/STP Alerts Section */}
        <div className="bg-white border border-gray-300">
          <div className="bg-gray-200 p-2">
            <h2 className="font-semibold text-gray-800">My SIP/STP Alerts</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">SNo</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Date Added</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Investor</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Scheme</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Start Date</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">End Date</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Installment<br />(Rupees)</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Frequency</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Alert on each Installment</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={10} className="border border-gray-300 p-8 text-center">
                    <div className="text-gray-600">
                      <p className="mb-2">No SIP/STP Alerts found.</p>
                      <button className="text-blue-600 hover:underline">[ Create ]</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Customized Alerts Section */}
        <div className="bg-white border border-gray-300">
          <div className="bg-gray-200 p-2">
            <h2 className="font-semibold text-gray-800">My Customized Alerts</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">SNo</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Date Added</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Investor</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Alert / Event Name</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Alert On</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Alert Expiry</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Frequency</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={8} className="border border-gray-300 p-8 text-center">
                    <div className="text-gray-600">
                      <p className="mb-2">No Customized Alerts found.</p>
                      <button className="text-blue-600 hover:underline">[ Create ]</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsDashboard;