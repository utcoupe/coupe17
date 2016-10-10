import pygame
from pygame.locals import *

from time import sleep, time

from table_de_mixage.ax12 import *
from table_de_mixage.music import *
from table_de_mixage.mix import *

#Initilaisation de pygame
pygame.init()

ax12.init()
ax12.move(getAX12PosFor("home"))

# Initialisation des "mixs" (scripts de la table de mixage)
mixs = {}
# key = keyboard key pygame constant
# param1 = string description
# param2 = duration in seconds (-1 infinite)
mixs[K_i] = ["buzz_leclair_infini", 3.5]
mixs[K_s] = ["stolen_dance", 102]
mixs[K_h] = ["home", 0]
mixs[K_b] = ["symetric_hand", 30]
mixs[K_d] = ["dev", 3000]
mixs[K_m] = ["macarena", 30]
#mixs[K_m] = ["tir", 30]

initMusics(mixs)

window = pygame.display.set_mode((600,300))

loop = True
t = time()
current_action = K_SPACE
while loop:
	c = time()
	for event in pygame.event.get():
		if event.type == KEYDOWN:
			if event.key == K_ESCAPE:
				loop = False
			if event.key == K_SPACE:
				current_action = K_SPACE
			elif current_action == K_SPACE:
				if event.key in mixs:
					t = c
					current_action = event.key
					lunchMix(mixs[event.key][0], 0)
	if current_action != K_SPACE:
		if c-t > mixs[current_action][1]:
			stopMix(mixs[current_action][0])
			current_action = K_SPACE
		else:
			lunchMix(mixs[current_action][0], c-t)