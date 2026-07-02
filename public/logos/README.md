# University logos

Drop official university logos here to replace the placeholder emblems on the
homepage "Trusted by students from" conveyor.

## How it works

`components/UniversityLogos.tsx` checks this folder at render time. If it finds a
file matching a university's **slug**, it renders that file instead of the
built-in placeholder emblem — **no code changes required**, just refresh.

## File naming

Save each logo using its slug and any of these extensions
(`svg` preferred — crisp at any size): `svg`, `png`, `webp`, `jpg`, `jpeg`.

| University        | File to add            |
| ----------------- | ---------------------- |
| Universität Wien  | `uni-wien.svg`         |
| TU Wien           | `tu-wien.svg`          |
| WU Wien           | `wu-wien.svg`          |
| BOKU              | `boku.svg`             |
| MedUni Wien       | `meduni-wien.svg`      |
| FH Campus Wien    | `fh-campus-wien.svg`   |

## Licensing

Logos in this folder are official university marks (sourced from Wikimedia Commons /
institutional press materials). They remain trademarks of the respective institutions.
Only use them in a truthful “students from these universities” context.

| University        | File                   | Source |
| ----------------- | ---------------------- | ------ |
| Universität Wien  | `uni-wien.svg`         | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Logo_of_the_University_of_Vienna.svg) |
| TU Wien           | `tu-wien.svg`          | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:TU_Logo.svg) |
| WU Wien           | `wu-wien.svg`          | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Logo_Wirtschaftsuniversit%C3%A4t_Wien.svg) |
| BOKU              | `boku.svg`             | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Boku-wien_randlos.svg) |
| MedUni Wien       | `meduni-wien.svg`      | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Meduni-wien.svg) |
| FH Campus Wien    | `fh-campus-wien.svg`   | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:FH_Campus_Wien_2018_logo.svg) |
