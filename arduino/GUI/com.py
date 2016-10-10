import serial
import threading
from variables import Variables
import time

class Communication:
	def __init__(self, path, baudrate):
		print("Opening serial port "+path+" ("+str(baudrate)+")")
		self.serial = serial.Serial(path, baudrate, timeout=1, writeTimeout=1)
		self.robot_ID = self.serial.read(1)
		self.vars = Variables("../asserv/protocol.h")
		print(self.vars)
		self.responses = {}
		self.start()

	def sendOrderSafe(self, order, ID=0, args=[]):
		try:
			self.sendOrder(order, ID, args)
		except IOError as e:
			print("Failed to send order "+order)
			print(e)
		
	def sendOrder(self, order, ID=0, args=[]):
		order = self.vars[order]
		order = order.strip("'")
		cmd = order+";"+str(int(ID))+";"
		for arg in args:
			cmd += str(int(arg))+";"
		cmd += "\n"
		try:
			self.serial.write(cmd.encode())
		except:
			raise IOError("Write failed")

		begin = time.time()
		while (order not in self.responses.keys() or self.responses[order] == ''):
			if time.time() - begin > 3:
				raise IOError("Arduino denied order (1)")
		self.responses[order] = ''
		if order not in self.responses.keys() or\
			"FAILED" in self.responses[order]:
				raise IOError("Arduino denied order (2)")
		else:
			return self.responses[order][4:].split(";")

	def goto(self, x, y, a=None):
		if a is not None:
			sendOrder(self.vars['GOTOA'], args=[x, y, a*self.vars['FLOAT_PRECISION']])
		else:
			sendOrder(self.vars['GOTO'], args=[x, y])

	def getTargetSpd(self):
		if '~' in self.responses.keys():
			status = self.responses['~']
		else:
		   status = '' 
		if status == '':
			return (0, 0)

		status = status.split(';')
		if len(status) < 7:
			return (0, 0)

		if len(status) % 2 == 1:
			spd = status[7:9]
		else:
			spd = status[6:8]
		return spd

	def getSpd(self):
		if '~' in self.responses.keys():
			status = self.responses['~']
		else:
		   status = '' 
		if status == '':
			return (0, 0)

		status = status.split(';')
		if len(status) % 2 == 1:
			spd = status[5:7]
		else:
			spd = status[4:6]
		return spd

	def getPos(self):
		if '~' in self.responses.keys():
			status = self.responses['~']
		else:
		   status = '' 
		if status == '':
			return (0, 0, 0)

		status = status.split(';')
		if len(status) % 2 == 1:
			pos = [float(x) for x in status[2:5]]
		else:
			pos = [float(x) for x in status[1:4]]
		return pos

	def stop(self):
		self.pause=True

	def start(self):
		self.pause=False
		self.thread = threading.Thread(target=self.readThread)
		self.thread.daemon = True
		self.thread.start()

	def readThread(self):
		while not self.pause:
			l = self.serial.readline()
			try:
				l = l.decode("ascii")[:-1]
			except:
				continue
			if len(l) > 0:
				self.responses[l[0]] = l
				if (l[0] == '~'):
					print(l)
				if (l[0] == '#'):
					print(l)
