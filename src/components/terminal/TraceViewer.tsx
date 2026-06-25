
export function TraceViewer() {
  return (
    <div className='font-mono text-[10px] bg-[#111111] p-3 border border-border/40 select-none'>
      <div className='text-primary font-bold mb-3 uppercase tracking-wider'>System Dependency Graph</div>
      
      {/* ASCII Architecture Flow Chart */}
      <pre className='text-[#E6EDF3] leading-tight overflow-x-auto no-scrollbar py-2'>
{` [USER REQUEST] ──► [gateway-api] (Public Gateway)
                     │
                     ├──► [checkout-api] ──► [inventory-api] ──► (Postgres)
                     │
                     └──► [payment-api]  ──► (Stripe Gateway)
                               │
                               └──► [redis-cache] ──► (Postgres)`}
      </pre>

      <div className='border-t border-border/30 mt-3 pt-3'>
        <div className='text-[9px] text-muted-foreground uppercase tracking-wider mb-2'>Active Transaction Spans</div>
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between text-foreground'>
            <div className='flex items-center space-x-1.5'>
              <span className='text-[#00FF88]'>●</span>
              <span>checkout-api ──► inventory-api</span>
            </div>
            <span className='text-muted-foreground font-semibold'>200 OK (22ms)</span>
          </div>

          <div className='flex items-center justify-between text-foreground'>
            <div className='flex items-center space-x-1.5'>
              <span className='text-[#FF5555]'>●</span>
              <span>payment-api ──► stripe-gateway</span>
            </div>
            <span className='text-[#FF5555] font-bold'>504 TIMEOUT (5012ms)</span>
          </div>

          <div className='flex items-center justify-between text-foreground'>
            <div className='flex items-center space-x-1.5'>
              <span className='text-[#FFB020]'>●</span>
              <span>gateway-api ──► payment-api</span>
            </div>
            <span className='text-[#FFB020] font-semibold'>504 GATEWAY (5024ms)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
