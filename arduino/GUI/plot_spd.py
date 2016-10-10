#!/usr/bin/python3

import sys
import matplotlib.pyplot as plt
import matplotlib.animation as animation

nr_data = 100
vmax = 10

def init():
	lreal.set_ydata(lr)
	ltarget.set_ydata(lt)
	rreal.set_ydata(rr)
	rtarget.set_ydata(rt)
	return lreal, ltarget, rreal, rtarget

def animate(i):
	l = ''
	while not '~' in l:
		l = sys.stdin.readline()
	l = l.split(';')
	lr.append(l[5])
	rr.append(l[6])
	lt.append(l[7])
	rt.append(l[8])
	lr.pop(0)
	rr.pop(0)
	lt.pop(0)
	rt.pop(0)
	lreal.set_ydata(lr)
	ltarget.set_ydata(lt)
	rreal.set_ydata(rr)
	rtarget.set_ydata(rt)
	return lreal, ltarget, rreal, rtarget


fig = plt.figure()
ax1 = fig.add_subplot(2, 1, 1)
ax2 = fig.add_subplot(2, 1, 2)

x = list(range(nr_data))
lr = lt = rr = rt = [0]*len(x)

lreal, = ax1.plot(x, lr)
ltarget, = ax1.plot(x, lt)
rreal, = ax2.plot(x, rr)
rtarget, = ax2.plot(x, rt)
ax1.set_ylim([-vmax, vmax])
ax2.set_ylim([-vmax, vmax])

ani = animation.FuncAnimation(fig, animate, init_func=init,
    interval=1, blit=True)

plt.show()
