export const projects = [
  {
    title: "ArduinoXRockwell",
    description: {
      fr: "Bibliothèque Rust/PyO3 pour communication EtherNet/IP avec PLCs Rockwell. Permet de lire et écrire des tags depuis Python.",
      en: "Rust/PyO3 library for EtherNet/IP communication with Rockwell PLCs. Allows reading and writing tags from Python.",
      jp: "RockwellのPLCとのEtherNet/IP通信用Rust/PyO3ライブラリ。PythonからタグをRead/Write可能。"
    },
    tags: ["Rust", "Python", "EtherNet/IP", "PyO3"],
    github: "https://github.com/N3koNoTsuki/ArduinoXRockwell",
    status: { fr: "En cours", en: "In progress", jp: "進行中" }
  },
  {
    title: "Linux_Conf_MP157D_DK1",
    description: {
      fr: "Driver I²C en Rust pour Linux embarqué sur STM32MP157A-DK1. Implémentation kernel-space avec Device Tree.",
      en: "Rust I²C kernel driver for embedded Linux on STM32MP157A-DK1. Kernel-space implementation with Device Tree.",
      jp: "STM32MP157A-DK1上の組み込みLinux用RustのI²Cカーネルドライバ。デバイスツリー付きのカーネルスペース実装。"
    },
    tags: ["Rust", "Linux", "STM32", "I²C", "Embedded"],
    github: "https://github.com/N3koNoTsuki/Linux_Conf_MP157D_DK1",
    status: { fr: "Terminé", en: "Done", jp: "完了" }
  }
];
