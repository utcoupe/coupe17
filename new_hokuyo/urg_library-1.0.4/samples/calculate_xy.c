/*!
*/

#include "urg_sensor.h"
#include "urg_utils.h"
#include "open_urg_sensor.h"
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

int norm(Ax, Ay, Bx, By) {
    return sqrt(pow(Ax-Bx, 2) + pow(Ay-By, 2));
}

int main(int argc, char *argv[])
{
    urg_t urg;
    long *data;
    long max_distance;
    long min_distance;
    long time_stamp;
    int i, j;
    int n;

    long clusters[100][3];
    int nb_clusters = 0;

    if (open_urg_sensor(&urg, argc, argv) < 0) {
        return 1;
    }

    data = (long *)malloc(urg_max_data_size(&urg) * sizeof(data[0]));
    if (!data) {
        perror("urg_max_index()");
        return 1;
    }
    while (1) {
        nb_clusters = 0;

        // \~japanese データ取得
        urg_start_measurement(&urg, URG_DISTANCE, 1, 0);
        n = urg_get_distance(&urg, data, &time_stamp);
        if (n < 0) {
            printf("urg_get_distance: %s\n", urg_error(&urg));
            urg_close(&urg);
            return 1;
        }

        // \~japanese X-Y 座標系の値を出力
        urg_distance_min_max(&urg, &min_distance, &max_distance);
        // test[0][0] = 
        int first = 1;
        for (i = 0; i < n; ++i) {
            long distance = data[i];
            double radian;
            long x;
            long y;
            long X, Y;

            if ((distance < min_distance) || (distance > max_distance)) {
                continue;
            }

            radian = urg_index2rad(&urg, i);
            x = (long)(distance * cos(radian));
            y = (long)(distance * sin(radian));

            X = x;
            Y = y+1000;
            // printf("%f %d\n", radian, distance);
            // if(distance < 1000 && radian*180/3.1416 < 90 && radian*180/3.1416 > -90)
                // printf("%lf, %ld\n", radian*180/3.1416, distance);
            if(X > 0 && X < 3000 && Y > 0 && Y < 2000) {
                // if(!first) printf(";"); else first = 0;
                // printf("%ld,%ld", X, Y);
                if(nb_clusters == 0) {
                    nb_clusters = 1;
                    clusters[0][0] = X;
                    clusters[0][1] = Y;
                    clusters[0][2] = 1;
                } else {
                    for(j = 0; j < nb_clusters; j++) {
                        // printf("%d %d %d %d %d ", X, Y, clusters[j][0]/clusters[j][2], clusters[j][1]/clusters[j][2], norm(clusters[j][0]/clusters[j][2], clusters[j][1]/clusters[j][2], X, Y));
                        // printf("\n");
                        if(norm(clusters[j][0]/clusters[j][2], clusters[j][1]/clusters[j][2], X, Y) < 150) {
                            clusters[j][0] += X;
                            clusters[j][1] += Y;
                            clusters[j][2]++;
                            break;
                        }
                    }
                    if(j == nb_clusters) {   
                        // printf("new cluster\n");
                        clusters[nb_clusters][0] = X;
                        clusters[nb_clusters][1] = Y;
                        clusters[nb_clusters][2] = 1;
                        nb_clusters++;
                    }
                }
            }


        }
        for(j = 0; j < nb_clusters; j++) {
            if(j > 0) printf(";");
            printf("%ld,%ld", clusters[j][0]/clusters[j][2], clusters[j][1]/clusters[j][2]);
        }
        printf("\n");
        fflush(stdout);
    }

    // \~japanese 切断
    free(data);
    urg_close(&urg);

#if defined(URG_MSC)
    getchar();
#endif
    return 0;
}
