#!/usr/bin/env python
# -*- coding: utf-8 -*-

from biquad_module import Biquad

from pylab import *

from math import *

import random, re

def ntrp(x,xa,xb,ya,yb):
  return (x-xa) * (yb-ya) / (xb-xa) + ya

sample_rate = 40000.0 # sampling frequency

cf = 1000

pll_integral = 0
old_ref = 0
pll_cf = 1000
pll_loop_gain = 0.00003
ref_sig = 0

invsqr2 = 1.0 / sqrt(2.0)

cutoff = .06 # Units Hz

loop_lowpass = Biquad(Biquad.LOWPASS,cutoff,sample_rate,invsqr2)

lock_lowpass = Biquad(Biquad.LOWPASS,cutoff,sample_rate,invsqr2)

ta = []
da = []
db = []

noise_level = 100 # +40 db

dur = 300 # very long run time

for n in range(int(sample_rate) * dur):
  t = n / sample_rate

  # BEGIN test signal block
  window = (0,1)[t > dur * .25 and t < dur * .75]
  test_sig = sin(2 * pi * cf * t) * window
  noise = (random.random() * 2 - 1) * noise_level
  test_sig += noise
  # END test signal block
  
  # BEGIN PLL block
  pll_loop_control = test_sig * ref_sig * pll_loop_gain
  pll_loop_control = loop_lowpass(pll_loop_control)
  pll_integral += pll_loop_control / sample_rate
  ref_sig = sin(2 * pi * pll_cf * (t + pll_integral))
  quad_ref = (ref_sig-old_ref) * sample_rate / (2 * pi * pll_cf)
  old_ref = ref_sig
  pll_lock = lock_lowpass(-quad_ref * test_sig)
  # END PLL block
  
  if(n % 100 == 0):
    ta.append(t)
    da.append(window)
    db.append(pll_lock * 2)

ylim(-.5,1.5)
plot(ta,da, label='Signal present')
plot(ta,db, label='PLL response')
grid(True)
legend(loc='lower right')
setp(gca().get_legend().get_texts(),fontsize=9)
locs, labels = xticks()
setp(labels,fontsize=8)
locs, labels = yticks()
setp(labels,fontsize=8)

gcf().set_size_inches(5,3.75)

name = re.sub('.*?(\w+).*','\\1',sys.argv[0])
savefig(name+'.png')

show()
