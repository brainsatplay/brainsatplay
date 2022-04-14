import Router from '../../../src/core/Router'
const router = new Router()

test('sends ping to receive pong', async () => {
    const expected = { message: ['pong'] }
    const actual = router.runRoute('ping', 'POST', [], null, null)
    expect(actual).resolves.toStrictEqual(expected);
});
