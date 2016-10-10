class Variables(dict):
    def __init__(self, path):
        f = open(path)
        for line in f:
            if line[0:7] == "#define":
                try:
                    s = line.split()
                    self[s[1]] = s[2]
                except Exception as e:
                    pass

