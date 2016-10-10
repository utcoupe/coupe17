import usb2ax
from time import sleep

class Ax12():
	def __init__(self):
		self.ax12 = None

	def init(self):
		while True:
			self.ax12 = usb2ax.Controller() #fix_sync_read_delay=True)
			if len(self.ax12.servo_list) >= 6 :
				break

	def move(self, l):
		for i in self.ax12.servo_list:
			self.write(i, l[i-1])

	def write(self, i, p):
		if i in self.ax12.servo_list:
			sleep(0.005)
			try:
				self.ax12.write(i, "goal_position", p*1024/300)
			except:
				pass

	def read(self, i):
		if i in self.ax12.servo_list:
			sleep(0.005)
			try:
				return self.ax12.read(i, "present_position")*300/1024
			except:
				return 150

	def stopTorque(self, l=[]):
		if l == []:
			l = self.ax12.servo_list
		for i in l:
			self.ax12.write(i, "torque_enable", 0)
			sleep(0.005)

ax12 = Ax12()

def getAX12PosFor(s):
	if s == "home":
		return [150]*6
	if s == "applause_open":
		return [150,155,155,150,145,145]
	if s == "applause_close":
		return [150,170,170,150,130,130]
	if s == "vague1_l":
		return [60,120,120,60,195,195]
	if s == "vague1_r":
		return [60,195,195,60,120,120]
	if s == "voler_h":
		return [110,60,150,190,240,150]
	if s == "voler_b":
		return [190,60,150,110,240,150]
	if s == "marionette_1":
		return [60,150,150,60,150,150]
	if s == "marionette_2":
		return [240,150,150,240,150,150]