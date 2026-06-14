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

## Tips

- **Use a single-colour / monochrome version** if the university offers one — the
  conveyor shows logos in grayscale and reveals colour on hover, so a flat logo
  looks best. Full-colour logos also work.
- Logos are normalised to the same **height** (~32px) with auto width, so the
  belt stays evenly spaced regardless of each logo's aspect ratio.
- **Licensing:** only add logos you have permission to display. A "Trusted by"
  claim should also be truthful — list institutions whose students actually use
  Dormra.
