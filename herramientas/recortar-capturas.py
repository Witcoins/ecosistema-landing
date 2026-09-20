# -*- coding: utf-8 -*-
"""
Recorta las capturas de I'Witutor para la app de la landing.
===========================================================

QUÉ HACE
--------
La app de I'Witutor que se ve en la landing NO muestra la captura
completa: el marco rojo de arriba y la columna de iconos de la
izquierda los dibuja la página, para que se puedan tocar de verdad.

Este script recibe la captura completa y saca la versión recortada,
que es la que usa la página.

    agenda.png   ->   p-agenda.webp

CÓMO SE USA
-----------
1. Deja las capturas nuevas (.png o .jpg) en la carpeta de la app:
     assets/img/witutor/     para la app de los papas
     assets/img/witeacher/   para la app de la profesora
2. Desde la carpeta del sitio:

       python herramientas/recortar-capturas.py witutor
       python herramientas/recortar-capturas.py witeacher

   Sin nombre, recorta la de witutor.

3. Escribe la ruta del recorte en js/witutor.js, en el bloque de
   esa sección:

       imagen: "assets/img/witutor/p-agenda.webp"

QUÉ RECORTA
-----------
Busca sola dónde termina la franja roja de arriba y corta ahí. De
la izquierda quita siempre 52 píxeles, que es lo que mide la
columna de iconos. Si la captura trae una franja roja al pie —la de
la frase—, también se la quita.

Funciona con capturas de pantalla de computador, de cualquier alto.
Si algún día la app cambia de colores o el menú cambia de ancho, se
corrigen los dos números de aquí abajo.
"""

import os
import sys

try:
    from PIL import Image
except ImportError:
    print("Falta Pillow. Instálalo con:  pip install Pillow")
    sys.exit(1)


APP = sys.argv[1] if len(sys.argv) > 1 else "witutor"
CARPETA = os.path.join("assets", "img", APP)

RECORTE_DERECHA = 2      # el filito del borde del navegador


def es_barra(pixel):
    """La franja de arriba: roja en la app de los papas, morada en
    la de la profesora. Las dos son oscuras y de color fuerte."""
    r, g, b = pixel[:3]
    rojo   = r > 170 and g < 100 and b < 100
    morado = b > 55 and r < 160 and g < 90 and b >= r - 10 and (r + b) > 90
    return rojo or morado


def es_blanco(pixel):
    return pixel[0] > 250 and pixel[1] > 250 and pixel[2] > 250


def ancho_del_menu(imagen, arriba, abajo):
    """La columna de iconos no siempre mide lo mismo: depende del
    zoom con que se tomo la captura. Se busca, en varias filas, la
    primera columna que deja de ser blanca, y se toma la de en
    medio para no tropezar con un icono."""
    alto = imagen.size[1]
    px = imagen.load()
    medidas = []
    for k in range(14):
        fila = arriba + 12 + int((abajo - arriba - 24) * k / 13.0)
        if fila >= alto or not es_blanco(px[2, fila]):
            continue
        for x in range(6, 150):
            if not es_blanco(px[x, fila]):
                medidas.append(x)
                break
    if not medidas:
        return 52
    medidas.sort()
    return medidas[len(medidas) // 2]


def alto_de_la_barra(imagen):
    """Baja por una columna de la derecha —donde no hay pastilla ni
    iconos— hasta que se acaba el rojo."""
    ancho, alto = imagen.size
    px = imagen.load()
    x = int(ancho * 0.72)
    fin = 0
    for y in range(alto):
        if es_barra(px[x, y]):
            fin = y + 1
        elif y > 5:
            break
    return fin


def donde_empieza_el_pie(imagen):
    """Algunas pantallas traen una franja roja abajo, con la frase.
    Se busca subiendo desde el borde de abajo."""
    ancho, alto = imagen.size
    px = imagen.load()
    x = int(ancho * 0.72)
    inicio = alto
    for y in range(alto - 1, 0, -1):
        if es_barra(px[x, y]):
            inicio = y
        else:
            break
    return inicio


def quitar_borde_del_navegador(imagen, abajo):
    """Las capturas suelen traer una franja oscura al final: el borde
    de la ventana del navegador. Se sube mientras la fila siga
    siendo casi negra."""
    ancho = imagen.size[0]
    px = imagen.load()
    y = abajo - 1
    while y > 0:
        muestras = [px[x, y] for x in range(0, ancho, max(1, ancho // 40))]
        claras = 0
        for r, g, b in muestras:
            if (r + g + b) / 3.0 > 70:
                claras += 1
        if claras > len(muestras) * 0.2:
            break
        y -= 1
    return y + 1


def recortar(ruta):
    nombre = os.path.basename(ruta)
    base, _ = os.path.splitext(nombre)

    imagen = Image.open(ruta).convert("RGB")
    ancho, alto = imagen.size

    arriba = alto_de_la_barra(imagen)
    abajo = donde_empieza_el_pie(imagen)
    abajo = quitar_borde_del_navegador(imagen, abajo)
    menu = ancho_del_menu(imagen, arriba, abajo)

    recorte = imagen.crop((menu, arriba, ancho - RECORTE_DERECHA, abajo))
    destino = os.path.join(CARPETA, "p-" + base + ".webp")
    recorte.save(destino, "WEBP", quality=88, method=6)

    print("  %-22s barra=%3d menu=%3d  ->  %s  (%dx%d, %.0f KB)" %
          (nombre, arriba, menu, os.path.basename(destino),
           recorte.size[0], recorte.size[1],
           os.path.getsize(destino) / 1024.0))


def main():
    if not os.path.isdir(CARPETA):
        print("No encuentro la carpeta %s." % CARPETA)
        print("Hay que correr esto desde la carpeta del sitio, la que")
        print("tiene el index.html al lado.")
        sys.exit(1)

    sirven = (".png", ".jpg", ".jpeg", ".webp")
    archivos = []
    for f in sorted(os.listdir(CARPETA)):
        if f.startswith("p-"):
            continue                      # ya es un recorte
        if f.lower().endswith(sirven):
            archivos.append(os.path.join(CARPETA, f))

    if not archivos:
        print("No hay capturas que recortar en %s." % CARPETA)
        return

    print("Recortando %d capturas:" % len(archivos))
    for ruta in archivos:
        recortar(ruta)

    print("")
    print("Listo. Ahora, en js/%s.js, cada pantalla tiene que" % APP)
    print("apuntar a su recorte, por ejemplo:")
    print('    imagen: "assets/img/%s/p-agenda.webp"' % APP)


if __name__ == "__main__":
    main()
