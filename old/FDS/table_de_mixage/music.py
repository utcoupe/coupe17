import pygame
import os.path


musics = {}

def initMusics(mixs):
	for i in mixs:
		name = mixs[i][0]
		temp = "music/" + name + ".ogg"
		if os.path.isfile(temp):
			musics[name] = pygame.mixer.Sound(temp)

def stopMusics():
	for i in musics:
		musics[i].stop()

def playMusic(s):
	stopMusics()
	
	if s in musics:
		musics[s].play()
	else:
		pass#print("Music " + s + " doesn't exist")