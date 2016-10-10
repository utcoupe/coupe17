import pygame
from pygame.locals import *

from time import sleep

from xbee import XBee
import serial

pygame.init()

fenetre = pygame.display.set_mode((100,100))
fusee = pygame.mixer.Sound("fusee.ogg")

PORT = '/dev/ttyUSB0'
BAUD_RATE = 57600
ser = serial.Serial(PORT, BAUD_RATE)
xbee = XBee(ser, escaped=True)

ORDER_LANCERBALLE = 50

ORDER_MOVEROBOT = 10
KUP = 0
KDOWN = 1
KLEFT = 2
KRIGHT = 3
KPDOWN = 0
KPUP = 1

def sendBytes(bytes):
	head = b'\x43'
	order = head + bytes
	xbee.send('tx', dest_addr=b'\x00\x43', data=order)

def sendOrder_LANCERBALLE(lanceur):
	sleep(0.1)
	if not lanceur in [1,2,4,5,7,8]:
		return
	fusee.play()
	bytes = ORDER_LANCERBALLE.to_bytes(1, "big") + b'\x00' + lanceur.to_bytes(1, "big")
	sendBytes(bytes)

def sendKeyDown(direction):
	bytes = ORDER_MOVEROBOT.to_bytes(1, "big") + b'\x00' + KPDOWN.to_bytes(1, "big") + direction.to_bytes(1, "big")
	sendBytes(bytes)
def sendKeyUp(direction):
	bytes = ORDER_MOVEROBOT.to_bytes(1, "big") + b'\x00' + KPUP.to_bytes(1, "big") + direction.to_bytes(1, "big")
	sendBytes(bytes)

loop = True
while loop:
	for event in pygame.event.get():
		if event.type == KEYDOWN:
			if event.key == K_ESCAPE:
				loop = False
			if event.key == K_KP1:
				sendOrder_LANCERBALLE(1)
			if event.key == K_KP2:
				sendOrder_LANCERBALLE(2)
			if event.key == K_KP4:
				sendOrder_LANCERBALLE(4)
			if event.key == K_KP5:
				sendOrder_LANCERBALLE(5)
			if event.key == K_KP7:
				sendOrder_LANCERBALLE(7)
			if event.key == K_KP8:
				sendOrder_LANCERBALLE(8)
			if event.key == K_UP:
				sendKeyDown(KDOWN);
			if event.key == K_DOWN:
				sendKeyDown(KUP);
			if event.key == K_LEFT:
				sendKeyDown(KLEFT);
			if event.key == K_RIGHT:
				sendKeyDown(KRIGHT);
		if event.type == KEYUP:
			if event.key == K_UP:
				sendKeyUp(KDOWN);
			if event.key == K_DOWN:
				sendKeyUp(KUP);
			if event.key == K_LEFT:
				sendKeyUp(KLEFT);
			if event.key == K_RIGHT:
				sendKeyUp(KRIGHT);

	"""
	#Chargement et collage du fond
	fond = pygame.image.load("background.jpg").convert()
	fenetre.blit(fond, (0,0))

	#Chargement et collage du personnage
	perso = pygame.image.load("perso.png").convert_alpha()
	position_perso = perso.get_rect()
	fenetre.blit(perso, position_perso)

	#Rafraîchissement de l'écran
	pygame.display.flip()

	"""	

	"""
	#Re-collage
	fenetre.blit(fond, (0,0))	
	fenetre.blit(perso, position_perso)
	#Rafraichissement
	pygame.display.flip()
	"""
