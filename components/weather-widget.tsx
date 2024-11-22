'use client'

export function WeatherWidget() {
  return (
    <div className="bg-[#33C1FF] text-white p-6 rounded-3xl max-w-xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-lg">Thursday, March 7</div>
          <div className="flex items-center gap-2">
            <span className="text-6xl font-bold">47°</span>
            <div className="w-8 h-8 rounded-full bg-[#FFE600]" />
          </div>
        </div>
        <div className="text-lg">Sunny</div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 text-center">
        {[
          { time: '7am', temp: '46°', icon: 'full' },
          { time: '8am', temp: '52°', icon: 'full' },
          { time: '9am', temp: '54°', icon: 'full' },
          { time: '10am', temp: '54°', icon: 'partial' },
          { time: '11am', temp: '56°', icon: 'partial' },
          { time: '12pm', temp: '58°', icon: 'partial' },
          { time: '1pm', temp: '60°', icon: 'partial' },
        ].map((hour, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <span className="text-sm">{hour.time}</span>
            <div className={`w-6 h-6 rounded-full ${hour.icon === 'full' ? 'bg-[#FFE600]' : 'bg-[#FFE600] opacity-80'}`} />
            <span className="text-sm font-medium">{hour.temp}</span>
          </div>
        ))}
      </div>
    </div>
  )
}