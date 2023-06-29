import kaboom from "kaboom"

const k = kaboom({
	background: [141, 183, 255],
})

const JUMP = 800

const SPEEDPLAYER = 350

const FALL_DEATH = 2400

k.loadSprite("bean", "sprites/bean.png")
k.loadSprite("brick", "sprites/brick.png")
k.loadSprite("coin", "sprites/coin.png")
k.loadSprite("portal", "sprites/portal.png")
k.loadSprite("spike", "sprites/spike.png")
k.loadSprite("grass", "sprites/grass.png")


k.setGravity(1600)

//****** Habilidades *********
//
//OK 1. carregar os niveis
//2. movimento de pregar na parede
//3. nadar
//4. tile trampoline
//5. tile parar
//7. atirar
//8. pulo duplo com mortal
//OK 9. tile que mata
//10. inimigos simples
//11. inimigos simples que voam
//12. chefe de fase
//13. chefe do portal
//14. historia
//15. npc
//
//cena 01
//menu principal 
//   - iniciar jogo
//   - opcoes
//cena 02
//menu opcoes
//   - volume musica
//   - volume fx
//cena 03 portal
//  - niveis
//cena 04 - jogo
//cena 05 - game over
//  - tentar novamente [video ad]
//  - ir para cena niveis

const LEVELS = [
	[
		"b               b",
		"b               b",
		"b              @b",
		"b          b----b",
		"----------------b",
	],
	[
		"b      dd    $$     @ b",
		"----------------------b",
	],
	[ 
		"b                                          b",
		"b                                          b",
		"b                                          b",
		"b                            @      $$$$   b", 
		"b                                   -----  b", 
		"b                                          b",
		"b      d      d             $$ --          b",
		"----------------------   ----------------- b",
	],

]

const levelConf = {
	tileWidth: 64,
	tileHeight: 64,
	tiles: {
		"b": () => [
			k.sprite("brick"),
			k.area(),
			k.body({ isStatic: true }),
			k.anchor("bot"),
			k.offscreen({ hide: true }),
			"parede",
		],
		"-": () => [
			k.sprite("grass"),
			k.area(),
			k.body({ isStatic: true }),
			k.anchor("bot"),
			"piso",
		],
		"$": () => [
			k.sprite("coin"),
			k.area(),
			k.pos(0, -9),
			k.anchor("bot"),
			k.offscreen({ hide: true }),
			"coin",
		],
		"d": () => [
			k.sprite("spike"),
			k.area(),
			k.body({ isStatic: true }),
			k.anchor("bot"),
			k.offscreen({ hide: true }),
			"danger",
		],
//		"e": () => [
//			sprite("ghosty"),
//			area(),
//			anchor("bot"),
//			body(),
//			patrol(),
//			offscreen({ hide: true }),
//			"enemy",
//		],
		"@": () => [
			k.sprite("portal"),
			k.area({ scale: 0.5 }),
			k.anchor("bot"),
			k.pos(0, -12),
			k.offscreen({ hide: true }),
			"portal",
		],
	},
}




scene("game", ({levelId, coins} = {levelId: 0, coins: 0}) => {

	const level = addLevel(LEVELS[levelId ?? 0], levelConf)

	let player = k.add([
		k.pos(0, 0),
		k.sprite("bean"),
		k.area(),
		k.body({jumpForce: JUMP}),
		"player",
		{
			speed: SPEEDPLAYER,
			//dir: choose([-1, 1]),
			dir: 1,
		},
	])
	
	player.onUpdate(() => {
		player.move(player.dir * player.speed, 0)
		camPos(player.pos)
		if (player.pos.y >= FALL_DEATH) {
			go("perdeu")
		}
	})

	//k.onUpdate("player", (p) => {
	//	p.move(p.dir * p.speed, SPEEDPLAYER)
	//})
	
	k.onClick(() => {
		if (player.isGrounded()) {
			player.jump()
		}
	})
	
	player.onCollide("danger", () => go("perdeu"))

	player.onCollide("coin", (coin) => {
		destroy(coin)
		coins++
		scoreLabel.text = coins

	})

	player.onCollide("parede", () => {
			player.dir = -player.dir			
	})

	//problema = pega a quina do objeto
	//fazer o objeto player sozinho em mapa montado eh um grande problema
	//terei tiles de piso e outros de parede


	const scoreLabel = add([
		text(coins),
		pos(24,24),
		fixed()
	])

	player.onCollide("portal", () => {
		if (levelId < LEVELS.length - 1) {
			go("game", {
				levelId: levelId + 1,
				coins: coins,
			})
		} else {
			// Otherwise we have reached the end of game, go to "win" scene!
			go("vitoria", { score: coins })
		}
	})


	
	//debug.inspect = true
})

scene("perdeu", () => {
	add([
		text("Perdeu Playboy!")
	])
	onKeyPress(() => go("game"))
})

scene("vitoria", (coins) => {
	add([
		text("Voce Ganhou!!!"),
		pos(12),
		text("Voce pegou "+coins+" moedas!!!!", {width: width()}),
		pos(24,24)
	])
	onKeyPress(() => go("game"))
})

go("game")