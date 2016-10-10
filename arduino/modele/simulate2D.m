function [ t, pos, Vlreal, Vrreal, Vat, Vt ] = simulate2D( init_pos, Vm, Acc, target_pos, HZ, entraxe, inaccuracy_max, delay, max_angle_to_rotate, K_distance_reduction )
    if nargin < 7
        inaccuracy_max = 0;
    end
    if nargin < 8
        delay = 0;
    end
    if nargin < 9
        max_angle_to_rotate = pi;
    end
    if nargin < 10
        K_distance_reduction = 10;
    end
    delay = round(delay*HZ);
    pos = init_pos;
    Vrtarget = zeros(1,delay); Vltarget = zeros(1,delay);
    Vlreal = 0; Vrreal = 0;
    dt = 1/HZ;
    Vat = 0; Vt = 0;
    i = 1; t = 0;
    MAX_TIME = 60; %s
    while (true)
        % calculate errors
        t = [t i*dt];
        dx = target_pos(1) - pos(end, 1);
        dy = target_pos(2) - pos(end, 2);
        da = wrapToPi(atan2(dy, dx) - pos(end,3));
        dd = sqrt(dx*dx + dy*dy);
        if abs(da) > max_angle_to_rotate
            dd = -dd;
            da = wrapToPi(da - pi);
        end
        ddd = dd * exp(-abs(K_distance_reduction*da));
        % convert angle to distance per wheel
        dda = da * (entraxe/2);
        % calculate speed
        Vat = [Vat, calcSpeed(Vat(end), Vm, Acc, dda, dt)];
        if (abs(da) > 180/180*pi)
            Vt = [Vt 0];
        else
            Vt = [Vt calcSpeed(Vt(end), Vm, Acc, ddd, dt)];
        end
        % calculate wheels speed
        Vltarget = [Vltarget, Vt(end) - Vat(end)];
        Vrtarget = [Vrtarget, Vt(end) + Vat(end)];
        % calculate real speed
        Vlreal = [Vlreal (Vltarget(end-delay) + (2*(0.5-rand)*inaccuracy_max))];
        Vrreal = [Vrreal (Vrtarget(end-delay) + (2*(0.5-rand)*inaccuracy_max))];
        % apply movement
        v = (Vrreal(end) + Vlreal(end)) / 2;
        va = (Vrreal(end) - Vlreal(end)) / (entraxe*2);
        pos(i+1,:) = pos(i,:) + [v*cos(pos(i,3)), v*sin(pos(i,3)), va ]./HZ;
        pos(i+1,3) = wrapToPi(pos(i+1,3));
        i = i + 1;
        
        if (abs(dd) < 0.001) || (t(i) > MAX_TIME)
            break;
        end;
    end
end

